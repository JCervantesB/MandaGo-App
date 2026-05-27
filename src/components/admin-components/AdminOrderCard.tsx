import { Pressable, Text, View } from 'react-native';
import type { AdminOrder } from '@/hooks/use-admin-orders';
import { STATUS_CONFIG } from '@/types/delivery-order';
import { formatDateSpanish } from '@/utils/date-formatters';

const PRIORITY_COLORS: Record<string, string> = {
  normal: 'bg-green-100',
  express: 'bg-yellow-100',
  urgente: 'bg-red-100',
};

const PRIORITY_TEXT_COLORS: Record<string, string> = {
  normal: 'text-green-700',
  express: 'text-yellow-700',
  urgente: 'text-red-700',
};

// Formatear tiempo de espera en cadena
function formatWaitingTime(dateString: string): string {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return `Hace ${Math.floor(diffHours / 24)} d`;
}

// Estados de ordenes que pueden ser asignadas a repartidores
const UNASSIGNED_STATUSES = ['creado', 'disponible'];

interface AdminOrderCardProps {
  order: AdminOrder;
  onPress: () => void;
}

// Tarjeta de orden para el panel admin con estado, prioridad y tiempo de espera
export function AdminOrderCard({ order, onPress }: AdminOrderCardProps) {
  const statusInfo = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? { label: order.status, color: '#6B7280' };
  const isUnassigned = UNASSIGNED_STATUSES.includes(order.status);

  return (
    <Pressable onPress={onPress} className="bg-surface rounded-2xl p-4 border border-border mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-base font-extrabold text-text">#{order.publicId}</Text>
          <Text className="text-xs text-text-muted mt-1">
            {formatDateSpanish(order.createdAt)}
          </Text>
          {isUnassigned && (
            <Text className="text-xs text-amber-600 font-medium mt-1">
              Esperando {formatWaitingTime(order.createdAt)}
            </Text>
          )}
        </View>
        <View
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${statusInfo.color}20` }}
        >
          <Text className="text-xs font-semibold" style={{ color: statusInfo.color }}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-xs text-text-muted">Paquete</Text>
          <Text className="text-xs font-medium text-text">{order.packageDescription}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-text-muted">Destinatario</Text>
          <Text className="text-xs font-medium text-text">{order.destName}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-text-muted">Dirección</Text>
          <Text className="text-xs font-medium text-text text-right flex-1 ml-4" numberOfLines={1}>
            {order.destAddress}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-3 mt-3 border-t border-border">
        {order.priority && order.priority !== 'normal' && (
          <View className={`px-2.5 py-1 rounded-full ${PRIORITY_COLORS[order.priority] ?? ''}`}>
            <Text className={`text-xs font-semibold ${PRIORITY_TEXT_COLORS[order.priority] ?? ''}`}>
              {order.priority.toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="text-xs text-text/60 ml-auto">Ver detalle</Text>
      </View>
    </Pressable>
  );
}