import { NativeModules, Platform } from 'react-native';

/**
 * Configuración de la URL base de la API para la aplicación móvil.
 * 
 * Propósito:
 * - Centralizar la URL del backend para facilitar mantenimiento y cambios de entorno.
 * - Detecta automáticamente la plataforma para usar la dirección correcta.
 * 
 * Para dispositivo físico (no emulador): configurar EXPO_PUBLIC_API_URL con la IP de la PC
 * Ejemplo: 192.168.1.100
 */
function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

function getDevServerHostname(): string | null {
  const scriptURL: unknown = (NativeModules as any)?.SourceCode?.scriptURL;
  if (typeof scriptURL !== 'string' || !scriptURL) return null;

  try {
    const url = new URL(scriptURL);
    const hostname = url.hostname;
    return hostname ? hostname : null;
  } catch {
    return null;
  }
}

function getDefaultApiBaseUrl(): string {
  if (__DEV__) {
    const devHost = getDevServerHostname();
    if (devHost) {
      if (
        Platform.OS === 'android' &&
        (devHost === 'localhost' || devHost === '127.0.0.1')
      ) {
        // Emulator: use 10.0.2.2 to reach host machine
        return 'http://10.0.2.2:3000/api';
      }
      // Physical device on same network: use dev host IP
      return `http://${devHost}:3000/api`;
    }
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://localhost:3000/api';
}

export const API_BASE_URL = envApiUrl
  ? normalizeBaseUrl(envApiUrl)
  : getDefaultApiBaseUrl();

