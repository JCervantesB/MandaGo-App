import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation } from 'lucide-react-native';
import { useEffect } from 'react';
import { BottomNavDelivery } from '@/components/delivery-components/BottomNavDelivery';
import { useAvailableOrders, getPriorityConfig } from '@/hooks/use-delivery-orders';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useOrderOffer } from '@/hooks/use-order-offer';
import { socketClient } from '@/services/socket-client';
import { appColors } from '@/theme/theme';

interface AvailableOrdersScreenProps {
  navigation: any;
}

export function AvailableOrdersScreen({ navigation }: AvailableOrdersScreenProps) {
  const { orders, isLoading, fetchOrders } = useAvailableOrders();
  const { profile } = useUserProfile();

  useOrderOffer(profile?.id ?? '');

  useEffect(() => {
    const unsubAvailable = socketClient.on('order:available', () => {
      console.log('[AvailableOrders] order:available received, refetching');
      void fetchOrders();
    });

    return () => {
      unsubAvailable();
    };
  }, [fetchOrders]);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <View className="px-5 pt-3 pb-4 bg-surface border-b border-border">
          <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">MandaGo</Text>
          <Text className="text-2xl font-extrabold text-text mt-1">Ordenes disponibles</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={appColors.primary} size="large" />
            <Text className="text-sm text-text/60 mt-3">Buscando ordenes...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="flex-1 items-center justify-center px-5">
            <View className="w-16 h-16 rounded-full bg-border items-center justify-center mb-3">
              <Navigation size={32} color={appColors.textMuted} />
            </View>
            <Text className="text-base font-semibold text-text mb-1">Sin ordenes disponibles</Text>
            <Text className="text-sm text-text/60 text-center">
              Actualmente no hay ordenes sin asignar. ¡Relájate y espera!
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => {
              const priorityConfig = getPriorityConfig(item.priority);
              return (
                <Pressable
                  onPress={() => navigation.navigate('DeliveryOrderFlow', { orderId: item.id })}
                  className="bg-white rounded-xl p-4 border border-border mb-3"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: priorityConfig.bgColor }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: priorityConfig.color }}
                      >
                        {priorityConfig.label}
                      </Text>
                    </View>
                    <Text className="text-xs text-text/50">#{item.publicId}</Text>
                  </View>

                  <View className="flex-row items-start mb-2">
                    <MapPin size={16} color={appColors.success} className="mr-2 mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-xs text-text/60 mb-0.5">Recoger en:</Text>
                      <Text className="text-sm font-medium text-text" numberOfLines={2}>
                        {item.originAddress}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start mb-3">
                    <Navigation size={16} color={appColors.mapDestination} className="mr-2 mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-xs text-text/60 mb-0.5">Entregar en:</Text>
                      <Text className="text-sm font-medium text-text" numberOfLines={2}>
                        {item.destAddress}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center pt-2 border-t border-border">
                    <View>
                      <Text className="text-xs text-text/60">Paquete</Text>
                      <Text className="text-sm font-medium text-text capitalize">{item.packageSize}</Text>
                    </View>
                    <View className="bg-green-600 px-3 py-1.5 rounded-lg">
                      <Text className="text-white text-xs font-semibold">Ver detalles</Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>

      <BottomNavDelivery activeScreen="Available" navigation={navigation} />
    </View>
  );
}