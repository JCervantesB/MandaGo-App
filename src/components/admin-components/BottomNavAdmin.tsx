/**
 * Navigation bar inferior para el panel de administrador.
 * Permite navegar rápidamente entre las vistas principales.
 *
 * Pestañas: Home, Ordenenes, Repartidores, Clientes, Configuración
 */
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Package, Truck, MessageCircle } from 'lucide-react-native';
import { appColors } from '@/theme/theme';

interface BottomNavAdminProps {
  activeScreen: string;
  navigation: any;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home, screen: 'AdminHome' },
  { id: 'orders', label: 'Ordenenes', icon: Package, screen: 'OrdersAdmin' },
  { id: 'drivers', label: 'Repartidores', icon: Truck, screen: 'DriversAdmin' },
  { id: 'chats', label: 'Chats', icon: MessageCircle, screen: 'AdminChats' },
];

// Barra de navegación inferior para el panel de administrador
export function BottomNavAdmin({ activeScreen, navigation }: BottomNavAdminProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row bg-white border-t border-border py-2 px-1" style={{ paddingBottom: insets.bottom }}>
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