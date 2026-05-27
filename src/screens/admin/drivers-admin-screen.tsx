import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavAdmin } from '@/components/admin-components/BottomNavAdmin';
import { Tabs, type TabItem } from '@/components/admin-components/Tabs';
import { DriversPending } from '@/components/admin-components/DriversPending';
import { DriversActive } from '@/components/admin-components/DriversActive';
import { DriversDisabled } from '@/components/admin-components/DriversDisabled';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DriversAdmin'>;

const TAB_KEYS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
};

const tabs: TabItem[] = [
  { key: TAB_KEYS.PENDING, label: 'Pendientes' },
  { key: TAB_KEYS.ACTIVE, label: 'Activos' },
  { key: TAB_KEYS.DISABLED, label: 'Deshabilitados' },
];

export function DriversAdminScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.PENDING);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="px-5 pt-4 pb-4 bg-surface border-b border-border">
          <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
            MandaGo
          </Text>

          <Text className="text-3xl font-extrabold text-text mt-1">
            Repartidores
          </Text>

          <Text className="text-sm text-text-muted mt-2 leading-5">
            Gestiona repartidores pendientes, activos y deshabilitados.
          </Text>

          <View className="mt-4">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </View>
        </View>

        <View className="flex-1 px-5 pt-4 pb-0">
          {activeTab === TAB_KEYS.PENDING && <DriversPending />}
          {activeTab === TAB_KEYS.ACTIVE && <DriversActive />}
          {activeTab === TAB_KEYS.DISABLED && <DriversDisabled />}
        </View>
      </SafeAreaView>

      <BottomNavAdmin activeScreen="DriversAdmin" navigation={navigation} />
    </View>
  );
}