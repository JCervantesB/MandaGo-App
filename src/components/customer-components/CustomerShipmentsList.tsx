import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Package } from 'lucide-react-native';
import { useCustomerShipments } from '@/hooks/use-customer-shipments';
import { appColors } from '@/theme/theme';
import { STATUS_CONFIG } from '@/types/delivery-order';
import type { CustomerShipment } from '@/types/shipment-types';

interface CustomerShipmentsListProps {
  onShipmentPress?: (shipment: CustomerShipment) => void;
  navigation?: any;
}

// Tarjeta compacta de envío para la lista
function ShipmentCardCompact({
  shipment,
  onPress,
}: {
  shipment: CustomerShipment;
  onPress?: () => void;
}) {
  const statusInfo = STATUS_CONFIG[shipment.status as keyof typeof STATUS_CONFIG] ?? { label: shipment.status, color: '#6B7280' };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-3 border border-border flex-row items-center"
    >
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: statusInfo.color + '20' }}
          >
            <Text className="text-xs font-semibold" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </Text>
          </View>
          <Text className="text-sm font-bold text-text">#{shipment.publicId}</Text>
        </View>
        <Text className="text-sm font-bold text-text">Entregar en {shipment.destName}</Text>
        <Text className="text-xs text-text/70" numberOfLines={1}>
          {shipment.destAddress}
        </Text>
      </View>
    </Pressable>
  );
}

// Lista de envíos del cliente con paginación y filtros
export function CustomerShipmentsList({ onShipmentPress, navigation }: CustomerShipmentsListProps) {
  const {
    shipments,
    isLoading,
    pagination,
    fetchPage,
    goToNextPage,
    goToPreviousPage,
  } = useCustomerShipments({ initialLimit: 10 });

  useEffect(() => {
    fetchPage(1);
  }, []);

  const handleShipmentPress = (shipment: CustomerShipment) => {
    if (onShipmentPress) {
      onShipmentPress(shipment);
    } else if (navigation) {
      navigation.navigate('ClientShipmentDetail', { shipmentId: shipment.id });
    }
  };

  const hasPreviousPage = pagination.currentPage > 1;
  const hasNextPage = pagination.currentPage < pagination.totalPages;

  return (
    <View className="mt-4">
      {isLoading && shipments.length === 0 ? (
        <View className="py-6 items-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : shipments.length === 0 ? (
        <View className="py-6 items-center">
          <Package size={40} color={appColors.textMuted} />
          <Text className="text-sm font-medium text-text/70 mt-2">No tienes envíos aún</Text>
          <Text className="text-xs text-text-muted mt-1">Crea tu primer envío para comenzar</Text>
        </View>
      ) : (
        <View className="gap-2">
          {shipments.map((shipment) => (
            <ShipmentCardCompact
              key={shipment.id}
              shipment={shipment}
              onPress={() => handleShipmentPress(shipment)}
            />
          ))}

          {pagination.totalPages > 1 && (
            <View className="flex-row justify-center items-center gap-3 py-2">
              <Pressable
                onPress={goToPreviousPage}
                disabled={!hasPreviousPage || isLoading}
                className={`py-1 px-3 rounded-lg ${hasPreviousPage ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <Text className={`text-xs font-medium ${hasPreviousPage ? 'text-white' : 'text-gray-400'}`}>
                  ←
                </Text>
              </Pressable>
              <Text className="text-xs text-text/60">
                {pagination.currentPage}/{pagination.totalPages}
              </Text>
              <Pressable
                onPress={goToNextPage}
                disabled={!hasNextPage || isLoading}
                className={`py-1 px-3 rounded-lg ${hasNextPage ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <Text className={`text-xs font-medium ${hasNextPage ? 'text-white' : 'text-gray-400'}`}>
                  →
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}