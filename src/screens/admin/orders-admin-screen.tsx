import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package } from 'lucide-react-native';
import { BottomNavAdmin } from '@/components/admin-components/BottomNavAdmin';
import { Tabs, type TabItem } from '@/components/admin-components/Tabs';
import { AdminOrderCard } from '@/components/admin-components/AdminOrderCard';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { appColors } from '@/theme/theme';

type StatusTab = 'todos' | 'activo' | 'completado' | 'cancelado';

const TABS: TabItem[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Activos' },
  { key: 'completado', label: 'Completados' },
  { key: 'cancelado', label: 'Cancelados' },
];

interface OrdersAdminScreenProps {
  navigation: any;
}

export function OrdersAdminScreen({ navigation }: OrdersAdminScreenProps) {
  const { orders, isLoading, pagination, activeTab, setActiveTab, fetchPage } = useAdminOrders();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-3 pb-4 bg-surface border-b border-border">
            <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
              MandaGo
            </Text>
            <Text className="text-3xl font-extrabold text-text mt-1">
              Ordenes
            </Text>
            <Text className="text-sm text-text-muted mt-1 leading-5">
              Todas las órdenes de la plataforma.
            </Text>
          </View>

          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as StatusTab)}
          />

          <View className="px-5 pt-4 pb-6">
            {isLoading ? (
              <View className="py-14 items-center">
                <ActivityIndicator color={appColors.primary} />
                <Text className="text-sm text-text/60 mt-3">Cargando ordenes...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View className="bg-surface border border-border rounded-2xl py-12 px-6 items-center">
                <View className="w-16 h-16 rounded-full bg-border items-center justify-center mb-3">
                  <Package size={32} color={appColors.textMuted} />
                </View>
                <Text className="text-base font-semibold text-text mb-1">Sin ordenes</Text>
                <Text className="text-sm text-text-muted text-center leading-5">
                  No hay ordenes en esta categoría.
                </Text>
              </View>
            ) : (
              <View>
                {orders.map((order) => (
                  <AdminOrderCard
                    key={order.id}
                    order={order}
                    onPress={() =>
                      navigation.navigate('AdminOrderDetail', {
                        orderId: order.id,
                      })
                    }
                  />
                ))}

                {pagination.totalPages > 1 && (
                  <View className="flex-row justify-center items-center gap-3 pt-4">
                    <Pressable
                      onPress={() => fetchPage(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1 || isLoading}
                      className={`py-2 px-4 rounded-xl ${
                        pagination.currentPage > 1 ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <Text className={`text-sm font-semibold ${
                        pagination.currentPage > 1 ? 'text-white' : 'text-text/50'
                      }`}>
                        Anterior
                      </Text>
                    </Pressable>

                    <Text className="text-sm text-text font-medium">
                      {pagination.currentPage} / {pagination.totalPages}
                    </Text>

                    <Pressable
                      onPress={() => fetchPage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                      className={`py-2 px-4 rounded-xl ${
                        pagination.currentPage < pagination.totalPages ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <Text className={`text-sm font-semibold ${
                        pagination.currentPage < pagination.totalPages ? 'text-white' : 'text-text/50'
                      }`}>
                        Siguiente
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavAdmin activeScreen="OrdersAdmin" navigation={navigation} />
    </View>
  );
}