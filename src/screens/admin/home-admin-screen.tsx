import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/auth/session-provider';
import { QuickAccess } from '@/components/admin-components/QuickAccess';
import { AdminStatsKpi } from '@/components/admin-components/AdminStatsKpi';
import { BottomNavAdmin } from '@/components/admin-components/BottomNavAdmin';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

export function AdminHomeScreen({ navigation }: Props) {
  const { session } = useSession();
  const userName = session?.user?.name || 'Administrador';

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          <View className="px-5 pt-4 pb-5 bg-surface border-b border-border">
            <View>
              <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
                MandaGo
              </Text>

              <Text className="text-3xl font-extrabold text-text mt-1">
                Panel administrativo
              </Text>

              <Text className="text-base font-semibold text-text mt-2">
                Hola, {userName}
              </Text>

              <Text className="text-sm text-text-muted mt-2 leading-5">
                Gestiona la operación diaria y accede rápidamente a los módulos principales.
              </Text>
            </View>
          </View>

          <View className="px-5 pt-4">
            <QuickAccess navigation={navigation} />
          </View>

          <View className="px-5 pt-4">
            <AdminStatsKpi />
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavAdmin activeScreen="AdminHome" navigation={navigation} />
    </View>
  );
}