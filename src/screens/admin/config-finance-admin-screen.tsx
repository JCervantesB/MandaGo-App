/**
 * Pantalla de Configuración financiera.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { BottomNavAdmin } from '@/components/admin-components/BottomNavAdmin';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfigFinanceAdmin'>;

export function ConfigFinanceAdminScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 p-5 items-center justify-center">
        <Text className="text-2xl font-bold text-text">Desde Configuración financiera</Text>
      </View>
      <BottomNavAdmin activeScreen="ConfigFinanceAdmin" navigation={navigation} />
    </View>
  );
}