import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle } from 'lucide-react-native';
import { BottomNavCustomer } from '@/components/customer-components/BottomNavCustomer';
import { EmptyState } from '@/components/customer-components/EmptyState';
import { PaginationControls } from '@/components/customer-components/PaginationControls';
import { ShipmentCard } from '@/components/customer-components/ShipmentCard';
import { StatusTabs } from '@/components/customer-components/StatusTabs';
import { useShipments } from '@/hooks/use-shipments';
import { appColors } from '@/theme/theme';

interface ShipmentsListScreenProps {
  navigation: any;
}

export function ShipmentsListScreen({ navigation }: ShipmentsListScreenProps) {
  const {
    shipments,
    isLoading,
    pagination,
    activeTab,
    setActiveTab,
    fetchPage,
  } = useShipments();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-3 pb-5 bg-surface border-b border-border">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 pr-4">
                <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
                  MandaGo
                </Text>
                <Text className="text-3xl font-extrabold text-text mt-1">
                  Mis envíos
                </Text>
                <Text className="text-sm text-text-muted mt-1 leading-5">
                  Revisa el estado de tus envíos y consulta su progreso.
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => navigation.navigate('ClientIncidents')}
                  className="bg-red-50 px-4 py-3 rounded-xl items-center justify-center border border-red-200"
                >
                  <AlertTriangle size={18} color={appColors.error} />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('ClientCreateShipment')}
                  className="bg-primary px-4 py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white text-sm font-semibold">+ Nuevo</Text>
                </Pressable>
              </View>
            </View>

            <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} />
            {isLoading ? (
              <View className="py-14 items-center">
                <ActivityIndicator color={appColors.primary} />
                <Text className="text-sm text-text/60 mt-3">Cargando envíos...</Text>
              </View>
            ) : shipments.length === 0 ? (
              <EmptyState
                title="No hay envíos"
                message="Cuando realices un nuevo envío, aparecerá aquí."
              />
            ) : (
              <View className="gap-3">
                {shipments.map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    onPress={() =>
                      navigation.navigate('ClientShipmentDetail', {
                        shipmentId: shipment.id,
                      })
                    }
                  />
                ))}

                {pagination.totalPages > 1 && (
                  <PaginationControls
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    isLoading={isLoading}
                    onPrevious={() => fetchPage(pagination.currentPage - 1)}
                    onNext={() => fetchPage(pagination.currentPage + 1)}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavCustomer activeScreen="ClientShipmentsList" navigation={navigation} />
    </View>
  );
}