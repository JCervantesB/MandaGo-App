import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsScreen } from '@/screens/shared/settings-screen';
import { BottomNavCustomer } from '@/components/customer-components/BottomNavCustomer';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientSettings'>;

export function MoreCustomerScreen(props: Props) {
  const { navigation } = props;
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <SettingsScreen />
      </SafeAreaView>
      <BottomNavCustomer activeScreen="ClientSettings" navigation={navigation} />
    </View>
  );
}