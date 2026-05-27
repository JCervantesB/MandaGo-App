/**
 * Componente StatusRibbon
 * Muestra el estado del usuario como un listón que ocupa todo el ancho
 */
import { View, Text } from 'react-native';
import { appColors } from '@/theme/theme';

type StatusType = 'active' | 'pending' | 'disabled';

interface StatusRibbonProps {
  status: string;
}

const statusConfig: Record<StatusType, { label: string; backgroundColor: string }> = {
  active: { label: 'Activo', backgroundColor: appColors.success },
  pending: { label: 'Pendiente', backgroundColor: appColors.warning },
  disabled: { label: 'Deshabilitado', backgroundColor: appColors.textSoft },
};

// Listón que muestra el estado del usuario (activo, pendiente, deshabilitado)
export function StatusRibbon({ status }: StatusRibbonProps) {
  const statusType: StatusType = status === 'activo' ? 'active'
    : status === 'pendiente_verificacion' ? 'pending'
    : 'disabled';

  const config = statusConfig[statusType];

  return (
    <View className="py-3 px-4 items-center" style={{ backgroundColor: config.backgroundColor }}>
      <Text className="text-base font-bold text-white uppercase tracking-wider">{config.label}</Text>
    </View>
  );
}