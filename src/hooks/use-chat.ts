import { useState, useEffect, useCallback } from 'react';
import { socketClient } from '@/services/socket-client';
import { API_BASE_URL } from '@/config/api';

export interface ChatChannel {
  id: number;
  orderId: number;
  customerId: string;
  driverId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  channelId: number;
  senderId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

// Hook para obtener canales de chat del usuario
export function useChatChannels() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Obtener canales de chat del usuario
  // Utiliza la API para obtener la lista de canales
  // Maneja errores y carga inicial
  const fetchChannels = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat/channels`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar canales');
      const data = await response.json();
      setChannels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching channels:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return { channels, isLoading, refetch: fetchChannels };
}

// Hook para obtener mensajes de un canal y enviar nuevos mensajes
export function useChatMessages(channelId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Obtener mensajes de un canal
  // Utiliza la API para obtener la lista de mensajes
  // Maneja errores y carga inicial
  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat/channels/${channelId}/messages`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar mensajes');
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [channelId]);

  // Join canal de chat y escuchar nuevos mensajes
  // Utiliza la API para enviar mensajes y escuchar nuevos mensajes
  // Maneja errores y carga inicial
  useEffect(() => {
    fetchMessages();

    const socket = socketClient.connect();
    if (socket) {
      socketClient.joinChatChannel(channelId);

      const handleNewMessage = (data: unknown) => {
        const message = data as ChatMessage;
        if (message.channelId === channelId) {
          setMessages((prev) => [...prev, message]);
        }
      };

      socket.on('chat:message', handleNewMessage);

      return () => {
        socket.off('chat:message', handleNewMessage);
        socketClient.leaveChatChannel(channelId);
      };
    }
  }, [channelId, fetchMessages]);

  // Enviar mensaje a un canal
  // Utiliza la API para enviar mensajes
  // Maneja errores y carga inicial
  const sendMessage = useCallback(async (content: string, imageBase64?: string, imageMimeType?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/channels/${channelId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageBase64, imageMimeType }),
      });
      if (!response.ok) throw new Error('Error al enviar mensaje');
      return await response.json();
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [channelId]);

  return { messages, isLoading, sendMessage, refetch: fetchMessages };
}