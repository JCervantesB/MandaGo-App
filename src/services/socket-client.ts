import { io, Socket } from 'socket.io-client';
import { NativeModules, Platform } from 'react-native';

function getSocketUrl(): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  function getDevServerHostname(): string | null {
    const scriptURL: unknown = (NativeModules as any)?.SourceCode?.scriptURL;
    if (!scriptURL) return null;
    try {
      const url = new URL(scriptURL as string);
      return url.hostname ?? null;
    } catch {
      return null;
    }
  }

  function isEmulator(): boolean {
    const host = getDevServerHostname();
    return host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.2';
  }

  if (apiUrl) {
    const normalized = apiUrl.trim().replace(/\/$/, '');
    if (normalized.startsWith('http')) {
      try {
        const url = new URL(normalized);
        return `${url.protocol}//${url.host}`;
      } catch {
        return normalized;
      }
    }
  }

  if (Platform.OS === 'android' && isEmulator()) {
    return 'http://10.0.2.2:3000';
  }

  const devHost = getDevServerHostname();
  return devHost ? `http://${devHost}:3000` : 'http://localhost:3000';
}

type SocketEventCallback = (data: unknown) => void;

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<SocketEventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {}

  static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = getSocketUrl();
    console.log('[SocketClient] Connecting to:', socketUrl);

    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 30000,
    });

    this.socket.on('connect', () => {
      console.log('[SocketClient] Connected to', socketUrl);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketClient] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketClient] Connection error:', error.message);
      this.reconnectAttempts++;
    });

    this.setupEventForwarding();

    return this.socket;
  }

  private setupEventForwarding() {
    if (!this.socket) return;

    this.socket.on('location_update', (data) => {
      console.log('[SocketClient] location_update event:', JSON.stringify(data));
    });
    this.socket.on('state_change', (data) => {
      console.log('[SocketClient] state_change event:', JSON.stringify(data));
    });

    this.socket.onAny((event, data) => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        console.log(`[SocketClient] onAny ${event}:`, JSON.stringify(data), 'handlers:', handlers.size);
        handlers.forEach((callback) => {
          try { callback(data); } catch (err) {
            console.error(`[SocketClient] Handler error for ${event}:`, err);
          }
        });
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
    this.reconnectAttempts = 0;
  }

  subscribeToOrder(orderId: number): void {
    this.socket?.emit('order:subscribe', { orderId });
  }

  unsubscribeFromOrder(orderId: number): void {
    this.socket?.emit('order:unsubscribe', { orderId });
  }

  subscribeToDriver(driverId: string): void {
    this.socket?.emit('driver:subscribe', { driverId });
  }

  joinDriversRoom(): void {
    this.socket?.emit('drivers:join');
  }

  joinChatChannel(channelId: number): void {
    this.socket?.emit('chat:join', { channelId });
  }

  leaveChatChannel(channelId: number): void {
    this.socket?.emit('chat:leave', { channelId });
  }

  on(event: string, callback: SocketEventCallback): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);
    return () => this.eventHandlers.get(event)?.delete(callback);
  }

  off(event: string, callback: SocketEventCallback): void {
    this.eventHandlers.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.eventHandlers.get(event)?.forEach((callback) => {
      try { callback(data); } catch (err) {
        console.error(`[SocketClient] Emit error for ${event}:`, err);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = SocketClient.getInstance();
export type { SocketEventCallback };