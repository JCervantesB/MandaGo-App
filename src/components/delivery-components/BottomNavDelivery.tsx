import { Pressable, Text, View } from 'react-native';
import { Home, Package, Wallet, User, AlertTriangle } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, DeliveryStackParamList, SharedStackParamList } from '@/navigation/types';

interface BottomNavDeliveryProps {
  activeScreen: 'Home' | 'Available' | 'Wallet' | 'Settings' | 'Incidents';
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

type DeliveryScreen = keyof DeliveryStackParamList | keyof SharedStackParamList;

const NAV_ITEMS: Array<{
  id: 'Home' | 'Available' | 'Wallet' | 'Settings';
  label: string;
  Icon: React.ComponentType<any>;
  screen: DeliveryScreen;
}> = [
  { id: 'Home', label: 'Inicio', Icon: Home, screen: 'DeliveryHome' },
  { id: 'Available', label: 'Disponibles', Icon: Package, screen: 'DeliveryAvailableOrders' },
  { id: 'Wallet', label: 'Cartera', Icon: Wallet, screen: 'DeliveryWallet' },
  { id: 'Settings', label: 'Cuenta', Icon: User, screen: 'Settings' },
];

// Barra de navegación inferior para repartidores
export function BottomNavDelivery({ activeScreen, navigation }: BottomNavDeliveryProps) {
  return (
    <View className="flex-row bg-surface border-t border-border px-2 py-2 pb-4">
      {NAV_ITEMS.map((item) => {
        const isActive = activeScreen === item.id;
        const Icon = item.Icon;
        return (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate(item.screen)}
            className="flex-1 items-center py-1"
          >
            <Icon
              size={22}
              color={isActive ? '#2563EB' : '#9CA3AF'}
            />
            <Text
              className={`text-xs mt-1 ${
                isActive ? 'text-primary font-semibold' : 'text-text/60'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}