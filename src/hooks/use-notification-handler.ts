import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Expo Push notifications (remote) fueron removidos de Expo Go en SDK 53+.
 * Verificar executionEnvironment permite detectar si estamos en Expo Go y evitar
 * inicializar expo-notifications, lo cual previene el error "Android Push notifications
 * functionality provided by expo-notifications was removed from Expo Go".
 *
 * El banner via socket.io sigue funcionando como fallback en Expo Go.
 * Para notificaciones push reales, se necesita un development build.
 */

const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Hook para manejar notificaciones push de Expo (navegación al tocar)
export function useNotificationHandler() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isExpoGo) return;

    const sub = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notifications] Received:', notification.request.content.data);
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        orderId?: number;
        type?: string;
      };
      console.log('[Notifications] Tapped:', data);

      if (data?.type === 'order_offer' && data?.orderId) {
        navigation.navigate('DeliveryOrderFlow', { orderId: data.orderId });
      }
    });

    return () => {
      sub.remove();
      responseSub.remove();
    };
  }, [navigation]);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (isExpoGo) return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
