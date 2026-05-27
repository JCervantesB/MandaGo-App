import { Pressable, Text, View } from 'react-native';
import {
  Package,
  Truck,
  Users,
  AlertTriangle,
  Coins,
  Settings,
} from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, AdminStackParamList } from '@/navigation/types';
import { appColors } from '@/theme/theme';

type AdminScreen = keyof AdminStackParamList;

const quickAccessItems: Array<{
  id: string;
  label: string;
  description: string;
  Icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  screen: AdminScreen;
}> = [
  {
    id: 'orders',
    label: 'Órdenes',
    description: 'Gestionar pedidos',
    Icon: Package,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    screen: 'OrdersAdmin',
  },
  {
    id: 'drivers',
    label: 'Repartidores',
    description: 'Ver conductores',
    Icon: Truck,
    iconColor: appColors.success,
    iconBg: '#DCFCE7',
    screen: 'DriversAdmin',
  },
  {
    id: 'customers',
    label: 'Clientes',
    description: 'Ver clientes',
    Icon: Users,
    iconColor: '#9333EA',
    iconBg: '#F3E8FF',
    screen: 'CustomersAdmin',
  },
  {
    id: 'incidents',
    label: 'Incidencias',
    description: 'Revisar reportes',
    Icon: AlertTriangle,
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
    screen: 'IncidentsAdmin',
  },
  {
    id: 'credits',
    label: 'Créditos',
    description: 'Movimientos',
    Icon: Coins,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    screen: 'CreditsAdmin',
  },
  {
    id: 'config',
    label: 'Config',
    description: 'Ajustes',
    Icon: Settings,
    iconColor: '#6B7280',
    iconBg: '#F3F4F6',
    screen: 'AdminSettings',
  },
];

interface QuickAccessProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

// Tarjetas de acceso rápido a secciones del admin
export function QuickAccess({ navigation }: QuickAccessProps) {
  return (
    <View className="mb-4">
      <Text className="text-base font-bold text-text mb-3 px-1">Accesos rápidos</Text>
      <View className="flex-row flex-wrap gap-2 justify-between">
        {quickAccessItems.map((item) => {
          const Icon = item.Icon;
          return (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate(item.screen)}
              className="bg-white rounded-2xl p-3 border border-border active:scale-95 items-center"
              style={{ width: '31%', minHeight: 95 }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                style={{ backgroundColor: item.iconBg }}
              >
                <Icon size={20} color={item.iconColor} />
              </View>
              <Text className="text-sm font-semibold text-text leading-tight">{item.label}</Text>
              <Text className="text-xs text-text-muted mt-0.5">{item.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}