import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Package, MessageCircle, Wallet, MoreHorizontal } from 'lucide-react-native';
import { appColors } from '@/theme/theme';

interface BottomNavCustomerProps {
  activeScreen: string;
  navigation: any;
}

const navItems = [
  { id: 'home', label: 'Inicio', icon: Home, screen: 'ClientHome' },
  { id: 'shipments', label: 'Envíos', icon: Package, screen: 'ClientShipments' },
  { id: 'chats', label: 'Chats', icon: MessageCircle, screen: 'ClientChats' },
  { id: 'wallet', label: 'Cartera', icon: Wallet, screen: 'ClientWallet' },
  { id: 'more', label: 'Más', icon: MoreHorizontal, screen: 'ClientSettings' },
];

// Barra de navegación inferior para clientes
export function BottomNavCustomer({ activeScreen, navigation }: BottomNavCustomerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="w-full flex-row bg-white border-t border-border px-1" style={{ paddingBottom: insets.bottom, paddingTop: 8 }}>
      {navItems.map((item) => {
        const isActive = activeScreen === item.screen;
        const Icon = item.icon;

        return (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate(item.screen)}
            className="flex-1 items-center justify-center py-1"
          >
            <Icon
              size={24}
              color={isActive ? appColors.primary : appColors.textMuted}
            />
            <Text
              className={`text-xs font-medium mt-0.5 ${isActive ? 'text-primary' : 'text-text'}`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}