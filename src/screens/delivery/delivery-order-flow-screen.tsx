import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import FullScreenDeliveryMap, { RouteType } from '@/components/delivery-components/FullScreenDeliveryMap';
import { DeliveryBottomSheet } from '@/components/delivery-components/DeliveryBottomSheet';
import { useActiveOrder } from '@/hooks/use-delivery-order-flow';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';
import type { DeliveryOrder, OrderStatus } from '@/types/delivery-order';
import { socketClient } from '@/services/socket-client';

interface DeliveryOrderFlowScreenProps {
  route?: { params?: { orderId?: number } };
  navigation: any;
}

function getRouteType(status: string): RouteType {
  switch (status) {
    case 'disponible':
    case 'asignado':
    case 'aceptado':
    case 'en_recorrido':
      return 'driver-to-pickup';
    case 'recogido':
    case 'en_entrega':
      return 'pickup-to-delivery';
    case 'entregado':
      return 'none';
    default:
      return 'both';
  }
}

// Pantalla de flujo de la orden de entrega.
export function DeliveryOrderFlowScreen({ route, navigation }: DeliveryOrderFlowScreenProps) {
  const { activeOrders, isLoading, refetch, updateStatus } = useActiveOrder();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);

  // Obtener la información de la orden específica desde el servidor.
  useEffect(() => {
    const orderId = route?.params?.orderId;
    if (!orderId) return;

    const orderFromActiveList = activeOrders.find((o) => o.id === orderId);
    if (orderFromActiveList) {
      setOrder(orderFromActiveList);
      return;
    }

    // Obtener la información de la orden específica desde el servidor.
    const fetchSpecificOrder = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/driver/orders/${orderId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const found = await response.json() as DeliveryOrder;
          setOrder(found);
        }
      } catch (err) {
        console.error('Error al obtener la información de la orden:', err);
      }
    };

    fetchSpecificOrder();
  }, [route?.params?.orderId, activeOrders]);

  // Manejar actualizaciones de estado de la orden y ubicación del conductor.
   useEffect(() => {
    const socket = socketClient.connect();
    if (!socket) return;

    socketClient.joinDriversRoom();

    // Manejar actualizaciones de estado de la orden.
    const handleOrderUpdate = (data: { orderId: number; status: string }) => {
      console.log('[DeliveryOrderFlow] Actualización de estado de la orden:', data);
      if (order && data.orderId === order.id) {
        setOrder((prev) => prev ? { ...prev, status: data.status as OrderStatus } : null);
      }
      refetch();
    };

    // Manejar actualizaciones de ubicación del conductor.
    const handleDriverLocationUpdate = (data: { orderId: number; lat: number; lon: number }) => {
      if (order && data.orderId === order.id) {
        console.log('[DeliveryOrderFlow] Actualización de ubicación del conductor:', data);
      }
    };

    const unsubOrder = socketClient.on('order:updated', handleOrderUpdate);
    const unsubLocation = socketClient.on('driver:location_updated', handleDriverLocationUpdate);

    return () => {
      unsubOrder();
      unsubLocation();
    };
  }, [order, refetch]);

  // Manejar la acción de asignar de la orden.
  const handleClaimOrder = async (orderId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/${orderId}/claim`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'No se pudo aceptar el pedido');
      }
      await refetch();
      return true;
    } catch (err) {
      throw err;
    }
  };

  // Manejar la acción de abandonar de la orden.
  const handleAbandonOrder = async (orderId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/${orderId}/abandon`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'No se pudo abandonar el pedido');
      }
      await refetch();
      return true;
    } catch (err) {
      throw err;
    }
  };

  // Manejar la acción de abrir chat con el cliente.
  const handleOpenChat = async () => {
    if (!order) return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat/orders/${order.id}/channel`, {
        method: 'POST',
        credentials: 'include',
      });
      const channel = await res.json();
      if (channel?.id) {
        navigation.navigate('DeliveryChatConversation', {
          channelId: channel.id,
          orderPublicId: `#${order.publicId}`,
          customerName: channel.customerName || 'Cliente',
        });
      }
    } catch {
      Alert.alert('Error', 'No se pudo abrir el chat');
    }
  };

  // Manejar la acción de aceptar de la orden.
  const handleAction = async (action: 'claim' | 'accept' | 'start_route' | 'mark_picked' | 'start_delivery' | 'confirm_delivery' | 'abandon') => {
    if (!order) return;

    const statusMap: Record<string, string> = {
      claim: 'asignado',
      accept: 'aceptado',
      start_route: 'en_recorrido',
      mark_picked: 'recogido',
      start_delivery: 'en_entrega',
      confirm_delivery: 'entregado',
    };

    const actionLabels: Record<string, string> = {
      claim: 'reclamar este pedido',
      accept: 'aceptar la orden',
      start_route: 'iniciar el recorrido',
      mark_picked: 'marcar como recogido',
      start_delivery: 'iniciar la entrega',
      confirm_delivery: 'confirmar la entrega',
    };

    const nextStatus = statusMap[action];

    Alert.alert(
      'Confirmar acción',
      `¿Confirmas ${actionLabels[action] ?? action}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            let success = false;
            let errorMessage = 'No se pudo completar la acción';
            if (action === 'claim') {
              try {
                success = await handleClaimOrder(order.id);
                if (success) await refetch();
              } catch (err) {
                errorMessage = err instanceof Error ? err.message : 'No se pudo completar la acción';
              }
            } else if (action === 'abandon') {
              Alert.alert(
                'Abandonar pedido',
                '¿Estás seguro de abandonar este pedido? Perderás los 5 créditos de aceptación y el pedido volverá a estar disponible.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Abandonar',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        success = await handleAbandonOrder(order.id);
                        if (success) {
                          Alert.alert('Pedido abandonado', 'Los 5 créditos no te serán reembolsados.');
                          await refetch();
                        }
                      } catch (err) {
                        Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo abandonar el pedido');
                      }
                    },
                  },
                ],
              );
              return;
            } else {
              success = await updateStatus(nextStatus);
            }

            if (success) {
              await refetch();
              if (nextStatus === 'entregado') {
                Alert.alert('¡Éxito!', 'Pedido entregado correctamente');
              }
            } else {
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ],
    );
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <SafeAreaView />
      </View>
    );
  }

  const routeType = getRouteType(order.status);

  return (
    <View style={styles.container}>
      <SafeAreaView className="absolute top-0 left-0 right-0 z-10" edges={['top']}>
        <View className="flex-row items-center px-4 py-3 bg-white/20 w-6/12 rounded-xl">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow"
          >
            <ArrowLeft size={20} color={appColors.primary} />
          </Pressable>
          <Text className="ml-3 text-lg font-bold text-primary shadow">OID: #{order?.publicId}</Text>
          
        </View>
      </SafeAreaView>

      <FullScreenDeliveryMap
        originLat={order.originLat}
        originLng={order.originLng}
        originAddress={order.originAddress}
        destLat={order.destLat}
        destLng={order.destLng}
        destAddress={order.destAddress}
        routeType={routeType}
      />

      <DeliveryBottomSheet
        order={order}
        onAction={handleAction}
        onClose={handleClose}
        onDeliveryConfirmed={() => navigation.goBack()}
        onChatPress={handleOpenChat}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: appColors.background,
  },
});