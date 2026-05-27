import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Hourglass, PackagePlus } from 'lucide-react-native';
import { useSession } from '@/auth/session-provider';
import { BottomNavCustomer } from '@/components/customer-components/BottomNavCustomer';
import { CustomerShipmentsList } from '@/components/customer-components/CustomerShipmentsList';
import { CustomerStatsKpi } from '@/components/customer-components/CustomerStatsKpi';
import { IncidentAlertBanner } from '@/components/customer-components/IncidentAlertBanner';

export function CustomerHomeScreen({ navigation }: { navigation: any }) {
  const { session, onboardingStatus } = useSession();

  const isPending = onboardingStatus?.status === 'pendiente_verificacion';
  const userName = session?.user?.name || 'Cliente';

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {isPending ? (
          <View className="flex-1 px-5 items-center justify-center">
            <View className="bg-surface border border-border rounded-3xl px-6 py-8 items-center max-w-[360px]">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-5">
                <Hourglass size={36} color="#01696f" />
              </View>

              <Text className="text-2xl font-extrabold text-text text-center mb-2">
                Cuenta en verificación
              </Text>

              <Text className="text-base text-text-muted text-center leading-6">
                Tu cuenta está siendo revisada por el equipo de MandaGo. Te avisaremos
                cuando esté lista para comenzar a operar.
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-1">
            <View className="px-5 pt-3 pb-6 bg-surface border-b border-border">
              <View className="flex-row items-center justify-between mb-5">
                <View>
                  <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
                    MandaGo
                  </Text>
                </View>
              </View>

              <View className="gap-1">
                <Text className="text-2xl font-extrabold text-text">
                  Hola, <Text className="text-primary">{userName}</Text>
                </Text>
                <Text className="text-sm text-text-muted leading-5">
                  Administra tus envíos, consulta su estado y crea nuevas solicitudes.
                </Text>
              </View>

              <View className="mt-5 bg-background border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-text mb-1">
                      Crear un nuevo envío
                    </Text>
                    <Text className="text-sm text-text-muted leading-5">
                      Registra un pedido y sigue su progreso desde un solo lugar.
                    </Text>
                  </View>

                  <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center">
                    <PackagePlus size={20} color="#01696f" />
                  </View>
                </View>

                <Pressable
                  onPress={() => navigation.navigate('ClientCreateShipment')}
                  className="mt-4 py-4 px-5 rounded-xl items-center justify-center bg-primary active:bg-primary-pressed flex-row"
                >
                  <Text className="text-white text-base font-semibold mr-2">
                    Nuevo envío
                  </Text>
                  <ArrowRight size={18} color="white" />
                </Pressable>
              </View>

              <IncidentAlertBanner
                onPress={() => navigation.navigate('ClientIncidents')}
              />
            </View>

            <ScrollView className="flex-1 px-5 pt-5 pb-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <CustomerStatsKpi
                onViewDetails={() => navigation.navigate('ClientShipmentsList')}
              />

              <View className="flex-row items-center justify-between mb-4 mt-6">
                <View>
                  <Text className="text-lg font-extrabold text-text">
                    Actividad reciente
                  </Text>
                  <Text className="text-sm text-text-muted mt-1">
                    Consulta tus envíos más recientes.
                  </Text>
                </View>
              </View>

              <View className="bg-surface border border-border rounded-2xl p-4">
                <CustomerShipmentsList navigation={navigation} />
              </View>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>

      {!isPending && (
        <BottomNavCustomer activeScreen="ClientHome" navigation={navigation} />
      )}
    </View>
  );
}
