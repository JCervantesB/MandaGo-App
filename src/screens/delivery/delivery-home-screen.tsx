import { useState } from 'react';
import { Pressable, Text, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, TrendingUp, MapPin, Navigation, ChevronRight, ArrowRight, CheckCircle, Wallet } from 'lucide-react-native';
import { BottomNavDelivery } from '@/components/delivery-components/BottomNavDelivery';
import { useActiveOrder, useAvailableOrdersSimple, useDeliveredOrders } from '@/hooks/use-delivery-order-flow';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useOrderOffer } from '@/hooks/use-order-offer';
import { useWallet } from '@/hooks/use-wallet';
import { appColors } from '@/theme/theme';
import { DriverStatsKpi } from '@/components/delivery-components/DriverStatsKpi';
import { DriverIncidentAlertBanner } from '@/components/delivery-components/DriverIncidentAlertBanner';

interface DeliveryHomeScreenProps {
  navigation: any;
}

const PRIORITY_CONFIG = {
  normal: { label: 'Normal', color: '#16A34A', bgColor: '#DCFCE7', cardBg: '#16A34A' },
  express: { label: 'Express', color: '#D97706', bgColor: '#FEF3C7', cardBg: '#D97706' },
  urgente: { label: 'Urgente', color: '#C2410C', bgColor: '#FFEDD5', cardBg: '#C2410C' },
};

export function DeliveryHomeScreen({ navigation }: DeliveryHomeScreenProps) {
  const { activeOrder, activeOrders } = useActiveOrder();
  const { orders: availableOrders, refetch, isLoading } = useAvailableOrdersSimple();
  const { orders: deliveredOrders, refetch: refetchDelivered } = useDeliveredOrders();
  const { profile } = useUserProfile();
  const { balance } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const { lastOffer } = useOrderOffer(profile?.id ?? '');

  const handleOfferPress = () => {
    if (lastOffer) {
      navigation.navigate('DeliveryOrderFlow', { orderId: lastOffer.orderId });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchDelivered()]);
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator color={appColors.primary} size="large" />
          <Text className="text-sm text-text/60 mt-3">Cargando...</Text>
        </SafeAreaView>
        <BottomNavDelivery activeScreen="Home" navigation={navigation} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="px-5 pt-3 pb-4 bg-surface border-b border-border">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">MandaGo</Text>
              <Text className="text-2xl font-extrabold text-text mt-1">Hola, Repartidor</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('DeliveryWallet')}
              className="bg-primary/10 px-3 py-2 rounded-xl flex-row items-center"
            >
              <Wallet size={18} color={appColors.primary} />
              <Text className="text-primary font-bold ml-2">{balance}</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[appColors.primary]} />
          }
        >
          {activeOrders.length > 0 && (
            <View className="px-4 pt-4">
              <View className="flex-row items-center mb-3">
                <Clock size={18} color={appColors.primary} />
                <Text className="text-base font-bold text-text ml-2">Pedidos activos ({activeOrders.length})</Text>
              </View>
              {activeOrders.map((order) => {
                const priority = PRIORITY_CONFIG[order.priority] || PRIORITY_CONFIG.normal;
                return (
                  <Pressable
                    key={order.id}
                    onPress={() => navigation.navigate('DeliveryOrderFlow', { orderId: order.id })}
                    style={{ backgroundColor: priority.cardBg, borderRadius: 16, padding: 16, marginBottom: 12 }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <Text className="text-white text-lg font-bold">#{order.publicId}</Text>
                        <View className="ml-3 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
                          <Text className="text-white text-xs font-bold">{priority.label}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-white/90 text-sm">Recoger: </Text>
                      <Text className="text-white/90 text-sm font-medium flex-1" numberOfLines={1}>
                        {order.originAddress || 'Cargando...'}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-white/90 text-sm">Entregar: </Text>
                      <Text className="text-white/90 text-sm font-medium flex-1" numberOfLines={1}>
                        {order.destAddress || 'Cargando...'}
                      </Text>
                    </View>
                    <View className="mt-3 pt-3 border-t border-white/20">
                      <Text className="text-white/60 text-xs">Tu ganancia</Text>
                      <Text className="text-white text-xl font-bold">
                        {typeof order.driverEarning === 'number' ? `${order.driverEarning} créditos` : 'N/A'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <DriverIncidentAlertBanner
            onPress={() => navigation.navigate('DriverIncidents')}
          />

          {lastOffer && (
            <View className="px-4 pt-4">
              <Pressable
                onPress={handleOfferPress}
                style={{ backgroundColor: '#DC2626', borderRadius: 16, padding: 16 }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="bg-white/30 rounded-full p-2 mr-3">
                      <Package size={20} color="white" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-base">Orden disponible</Text>
                      <Text className="text-white/80 text-sm">
                        #{lastOffer.orderId} • {lastOffer.distanceKm.toFixed(1)} km de distancia
                      </Text>
                    </View>
                  </View>
                  <View className="bg-white/30 rounded-full p-2">
                    <ArrowRight size={20} color="white" />
                  </View>
                </View>
              </Pressable>
            </View>
          )}

          <View className="px-4 pt-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Package size={18} color={appColors.primary} />
                <Text className="text-base font-bold text-text ml-2">Ordenes disponibles</Text>
              </View>
              {availableOrders.length > 0 && (
                <Pressable onPress={() => navigation.navigate('DeliveryAvailableOrders')}>
                  <Text className="text-sm text-primary font-semibold">Ver todos</Text>
                </Pressable>
              )}
            </View>

            {availableOrders.length === 0 ? (
              <View className="bg-white rounded-xl p-6 border border-border items-center">
                <Package size={32} color={appColors.textMuted} />
                <Text className="text-sm text-text/60 mt-2">No hay ordenes disponibles</Text>
                <Text className="text-xs text-text/50 mt-1">¡Relájate, ya llegará uno!</Text>
              </View>
            ) : (
              availableOrders.map((order) => {
                const priority = PRIORITY_CONFIG[order.priority];
                return (
                  <Pressable
                    key={order.id}
                    onPress={() => navigation.navigate('DeliveryOrderFlow', { orderId: order.id })}
                    className="bg-white rounded-xl p-4 mb-3 border border-border"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-bold text-text">#{order.publicId}</Text>
                      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: priority.bgColor }}>
                        <Text className="text-xs font-semibold" style={{ color: priority.color }}>
                          {priority.label}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={14} color={appColors.success} />
                      <Text className="text-xs text-text/70 ml-1 flex-1" numberOfLines={1}>
                        {order.originAddress}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Navigation size={14} color={appColors.mapDestination} />
                      <Text className="text-xs text-text/70 ml-1 flex-1" numberOfLines={1}>
                        {order.destAddress}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-border">
                      <Text className="text-xs text-text/50">{order.packageSize}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-sm font-bold text-green-600">{order.driverEarning} créditos</Text>
                        <ChevronRight size={16} color={appColors.textMuted} />
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>

          {deliveredOrders.length > 0 && (
            <View className="px-4 pt-4">
              <View className="flex-row items-center mb-3">
                <CheckCircle size={18} color={appColors.success} />
                <Text className="text-base font-bold text-text ml-2">Últimos entregados</Text>
              </View>
              {deliveredOrders.slice(0, 5).map((order) => (
                <Pressable
                  key={order.id}
                  onPress={() => navigation.navigate('DeliveryOrderFlow', { orderId: order.id })}
                  className="bg-white rounded-xl p-3 mb-2 border border-border"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-text">#{order.publicId}</Text>
                    <Text className="text-xs text-green-600 font-semibold">{order.driverEarning} créditos</Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Navigation size={12} color={appColors.mapDestination} />
                    <Text className="text-xs text-text/70 ml-1 flex-1" numberOfLines={1}>
                      {order.destAddress}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View className="px-4 pt-4 pb-4">
            <DriverStatsKpi onViewDetails={() => navigation.navigate('DeliveryWallet')} />
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavDelivery activeScreen="Home" navigation={navigation} />
    </View>
  );
}