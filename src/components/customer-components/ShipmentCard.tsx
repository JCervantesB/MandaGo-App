import { Pressable, Text, View } from 'react-native';
import type { CustomerShipment } from '@/types/shipment-types';
import { STATUS_CONFIG } from '@/types/delivery-order';
import { formatDateSpanish } from '@/utils/date-formatters';

interface ShipmentCardProps {
  shipment: CustomerShipment;
  onPress: () => void;
}

// Tarjeta de envío con estado, fecha y dirección
export function ShipmentCard({ shipment, onPress }: ShipmentCardProps) {
  const statusInfo = STATUS_CONFIG[shipment.status as keyof typeof STATUS_CONFIG] ?? { label: shipment.status, color: '#6B7280' };

  return (
    <Pressable onPress={onPress} className="bg-surface rounded-2xl p-4 border border-border">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-base font-extrabold text-text">#{shipment.publicId}</Text>
          <Text className="text-xs text-text-muted mt-1">
            Creado el {formatDateSpanish(shipment.createdAt)}
          </Text>
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

      <View className="gap-3">
        <View>
          <Text className="text-xs font-medium text-text-muted mb-1">Destinatario</Text>
          <Text className="text-sm text-text font-medium">{shipment.destName}</Text>
        </View>
        <View>
          <Text className="text-xs font-medium text-text-muted mb-1">Dirección destino</Text>
          <Text className="text-sm text-text" numberOfLines={2}>{shipment.destAddress}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-3 mt-3 border-t border-border">
        <Text className="text-xs text-text/60">Ver detalle</Text>
        {shipment.priority && shipment.priority !== 'normal' && (
          <View
            className={`px-2.5 py-1 rounded-full ${
              shipment.priority === 'express' ? 'bg-yellow-100' : 'bg-red-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                shipment.priority === 'express' ? 'text-yellow-700' : 'text-red-700'
              }`}
            >
              {shipment.priority.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}