import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, User, MapPin, Clock, MessageCircle } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomNavAdmin } from '@/components/admin-components/BottomNavAdmin';
import { OrderDetailContent } from '@/components/shared/OrderDetailContent';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import { API_BASE_URL } from '@/config/api';
import { appColors } from '@/theme/theme';
import type { AdminStackParamList } from '@/navigation/types';

interface AdminOrderDetail {
  id: number;
  publicId: string;
  status: string;
  priority: string;
  packageDescription: string;
  packageSize: string;
  packageWeight: string;
  packageDimensions: string;
  destName: string;
  destPhone: string;
  destAddress: string;
  originAddress: string;
  originLat: string;
  originLng: string;
  destLat: string;
  destLng: string;
  serviceFee: number;
  productPaymentMode: string;
  productAmountMxn: number;
  deliveryEvidenceUrl: string | null;
  deliveryReceiverName: string | null;
  deliveryReceiverRelation: string | null;
  deliveryNotes: string | null;
  deliveredAt: string | null;
  createdAt: string;
  driverId?: string;
  lastDriverLocation?: { lat: number; lng: number } | null;
}

interface EligibleDriver {
  driverId: string;
  driverName: string;
  distanceKm: number;
  activeOrderCount: number;
}

interface EligibleDriversResponse {
  drivers: EligibleDriver[];
  error?: string;
}

interface AdminOrderDetailScreenProps {
  route?: { params?: { orderId?: number } };
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminOrderDetail'>;
}

const TRACKING_STATUSES = ['asignado', 'aceptado', 'en_recorrido', 'recogido', 'en_entrega', 'incidencia'];
const ASSIGNABLE_STATUSES = ['creado', 'disponible'];
const UNASSIGNABLE_STATUSES = ['asignado', 'aceptado', 'en_recorrido'];

export function AdminOrderDetailScreen({ route, navigation }: AdminOrderDetailScreenProps) {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eligibleDrivers, setEligibleDrivers] = useState<EligibleDriver[]>([]);
  const [driversError, setDriversError] = useState<string | null>(null);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [channelId, setChannelId] = useState<number | null>(null);

  const canTrackDriver = order && order.driverId && !['entregado', 'cancelado'].includes(order.status);
  const canAssign = order && ASSIGNABLE_STATUSES.includes(order.status);
  const canUnassign = order && order.driverId && UNASSIGNABLE_STATUSES.includes(order.status);
  const hasDriver = order && order.driverId;

  const { driverLocation } = useTrackingSocket({
    orderId: canTrackDriver ? order.id : null,
    enabled: canTrackDriver,
  });

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al cargar la orden');
        }

        const responseData = await response.json();
        setOrder(responseData);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order?.id || !hasDriver) return;

    const fetchChannel = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/orders/${order.id}/channel`, {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();
        if (data?.id) setChannelId(data.id);
      } catch {
        // no chat available
      }
    };

    fetchChannel();
  }, [order?.id, hasDriver]);

  useEffect(() => {
    if (!orderId || !canAssign) return;

    const fetchEligibleDrivers = async () => {
      setIsLoadingDrivers(true);
      try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/eligible-drivers`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data: EligibleDriversResponse = await response.json();
          setEligibleDrivers(data.drivers ?? []);
          if (data.error) {
            setDriversError(data.error);
          } else {
            setDriversError(null);
          }
        }
      } catch (err) {
        console.error('Error fetching eligible drivers:', err);
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    fetchEligibleDrivers();
  }, [orderId, canAssign, order?.status]);

  const handleOfferDriver = async (driverId: string, driverName: string, distanceKm: number) => {
    if (!order) return;

    Alert.alert(
      'Ofrecer orden',
      `¿Quieres ofrecer esta orden a ${driverName}? El repartidor podrá aceptarla o rechazarla.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ofrecer',
          style: 'default',
          onPress: async () => {
            setIsAssigning(true);
            try {
              const response = await fetch(`${API_BASE_URL}/admin/orders/${order.id}/offer-driver`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ driverId, driverName, distanceKm }),
              });

              const data = await response.json();
              if (response.ok && data.success) {
                Alert.alert('Éxito', 'Orden ofrecida al repartidor');
                setEligibleDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
              } else {
                Alert.alert('Error', data.error ?? 'No se pudo ofrecer la orden');
              }
            } catch (err) {
              Alert.alert('Error', 'No se pudo ofrecer la orden');
            } finally {
              setIsAssigning(false);
            }
          },
        },
      ],
    );
  };

  const handleUnassign = async () => {
    if (!order) return;

    Alert.alert(
      'Desasignar repartidor',
      '¿Estás seguro de desasignar al repartidor? La orden volverá a estar disponible para otros repartidores.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desasignar',
          style: 'destructive',
          onPress: async () => {
            setIsUnassigning(true);
            try {
              const response = await fetch(`${API_BASE_URL}/admin/orders/${order.id}/unassign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
              });

              const data = await response.json();
              if (response.ok && data.success) {
                Alert.alert('Éxito', 'Repartidor desasignado');
                navigation.goBack();
              } else {
                Alert.alert('Error', data.error ?? 'No se pudo desasignar');
              }
            } catch (err) {
              Alert.alert('Error', 'No se pudo desasignar');
            } finally {
              setIsUnassigning(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator color={appColors.primary} size="large" />
          <Text className="text-sm text-text/60 mt-3">Cargando detalles...</Text>
        </SafeAreaView>
        <BottomNavAdmin activeScreen="OrdersAdmin" navigation={navigation} />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1 justify-center items-center">
          <AlertCircle size={48} color={appColors.error} />
          <Text className="text-lg font-semibold text-text mt-4">Orden no encontrada</Text>
          <Text className="text-sm text-text/60 mt-2">La orden no existe.</Text>
        </SafeAreaView>
        <BottomNavAdmin activeScreen="OrdersAdmin" navigation={navigation} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <OrderDetailContent order={order} showServiceFee driverLocation={driverLocation ?? (order as any).lastDriverLocation} />

          {channelId && (
            <View className="px-5 pb-4">
              <Pressable
                onPress={() =>
                  navigation.navigate('AdminChatConversation', {
                    channelId,
                    orderPublicId: order.publicId,
                  })
                }
                className="flex-row items-center justify-center bg-primary rounded-xl py-3 px-4"
              >
                <MessageCircle size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Ver conversación</Text>
              </Pressable>
            </View>
          )}

          {canAssign && (
            <View className="px-5 pb-4">
              <View className="bg-surface rounded-2xl border border-border p-4">
                <Text className="text-base font-bold text-text mb-3">Ofrecer orden a repartidor</Text>

                {isLoadingDrivers ? (
                  <View className="py-6 items-center">
                    <ActivityIndicator color={appColors.primary} />
                    <Text className="text-sm text-text/60 mt-2">Buscando repartidores...</Text>
                  </View>
                ) : driversError ? (
                  <View className="py-6 items-center">
                    <Text className="text-sm text-red-500 text-center">{driversError}</Text>
                  </View>
                ) : eligibleDrivers.length === 0 ? (
                  <View className="py-6 items-center">
                    <Text className="text-sm text-text/60">No hay repartidores disponibles</Text>
                  </View>
                ) : (
                  <View className="gap-2">
                    {eligibleDrivers.map((driver) => (
                      <Pressable
                        key={driver.driverId}
                        onPress={() => handleOfferDriver(driver.driverId, driver.driverName, driver.distanceKm)}
                        disabled={isAssigning}
                        className="flex-row items-center justify-between bg-background rounded-xl p-3 border border-border active:bg-primary/5"
                      >
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                            <User size={18} color={appColors.primary} />
                          </View>
                          <View className="ml-3 flex-1">
                            <Text className="text-sm font-semibold text-text">{driver.driverName}</Text>
                            <View className="flex-row items-center gap-3 mt-0.5">
                              <View className="flex-row items-center gap-1">
                                <MapPin size={12} color={appColors.textMuted} />
                                <Text className="text-xs text-text-muted">
                                  {driver.distanceKm.toFixed(1)} km
                                </Text>
                              </View>
                              <View className="flex-row items-center gap-1">
                                <Clock size={12} color={appColors.textMuted} />
                                <Text className="text-xs text-text-muted">
                                  {driver.activeOrderCount} ordenes activas
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View className="px-3 py-1.5 bg-primary rounded-lg">
                          <Text className="text-xs font-semibold text-white">
                            {isAssigning ? 'Ofreciendo...' : 'Ofrecer'}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {canUnassign && (
            <View className="px-5 pb-4">
              <Pressable
                onPress={handleUnassign}
                disabled={isUnassigning}
                className="bg-red-50 border border-red-200 rounded-xl p-4 items-center active:bg-red-100"
              >
                <Text className="text-red-600 font-semibold">
                  {isUnassigning ? 'Desasignando...' : 'Desasignar repartidor'}
                </Text>
                <Text className="text-xs text-red-500 mt-1">
                  La orden volverá a estar disponible
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <BottomNavAdmin activeScreen="OrdersAdmin" navigation={navigation} />
    </View>
  );
}