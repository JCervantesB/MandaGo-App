import { Image } from 'react-native';
import { MapPin, Flag, Package, Clock, Phone, User, Camera } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { ShipmentMap } from '@/components/shipment/ShipmentMap';
import { appColors } from '@/theme/theme';
import { STATUS_CONFIG } from '@/types/delivery-order';
import { formatDateFullFull } from '@/utils/date-formatters';

// Contenido compartido para mostrar detalle de orden (mapa, datos del paquete, destinatario)
export interface OrderDetailData {
  id: number;
  publicId: string;
  status: string;
  priority: string;
  packageDescription: string;
  packageSize: string;
  packageWeight?: string | null;
  packageDimensions?: string | null;
  destName: string;
  destPhone: string;
  destAddress: string;
  originAddress: string;
  originLat: string;
  originLng: string;
  destLat: string;
  destLng: string;
  serviceFee?: number;
  productPaymentMode: string;
  productAmountMxn: number;
  deliveryEvidenceUrl?: string | null;
  deliveryReceiverName?: string | null;
  deliveryReceiverRelation?: string | null;
  deliveryNotes?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

interface OrderDetailContentProps {
  order: OrderDetailData;
  showServiceFee?: boolean;
  showMap?: boolean;
  driverLocation?: { lat: number; lng: number } | null;
}

// Contenido compartido para mostrar detalle de orden (mapa, datos del paquete, destinatario)
export function OrderDetailContent({ order, showServiceFee = false, showMap = true, driverLocation = null }: OrderDetailContentProps) {
  if (!order) return null;
  const statusInfo = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? { label: order.status, color: '#6B7280' };

  return (
    <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
      <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
        MandaGo
      </Text>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-text">Orden #{order.publicId}</Text>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusInfo.color + '20' }}
        >
          <Text className="text-sm font-semibold" style={{ color: statusInfo.color }}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {order.priority && order.priority !== 'normal' && (
        <View className={`mb-4 px-3 py-2 rounded-lg ${order.priority === 'express' ? 'bg-yellow-100' : 'bg-red-100'}`}>
          <Text className={`text-sm font-semibold text-center ${order.priority === 'express' ? 'text-yellow-800' : 'text-red-800'}`}>
            Prioridad {order.priority.toUpperCase()}
          </Text>
        </View>
      )}

      {showMap && order.originLat && order.originLng && (
        <View className="h-52 rounded-2xl overflow-hidden mb-4 border border-border">
          <ShipmentMap
            origin={{ id: 'origin', formatted: order.originAddress, lat: parseFloat(order.originLat), lon: parseFloat(order.originLng), type: 'house' }}
            destination={{ id: 'dest', formatted: order.destAddress, lat: parseFloat(order.destLat), lon: parseFloat(order.destLng), type: 'house' }}
            routeInfo={null}
            initialLocation={{ lat: parseFloat(order.destLat), lon: parseFloat(order.destLng) }}
            driverLocation={driverLocation}
          />
        </View>
      )}

      <View className="bg-white rounded-2xl p-4 border border-border mb-4">
        <Text className="text-base font-bold text-text mb-3">Dirección de origen</Text>
        <View className="flex-row items-start">
          <MapPin size={20} color={appColors.success} className="mr-2 mt-0.5" />
          <Text className="text-sm text-text flex-1">{order.originAddress}</Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4 border border-border mb-4">
        <Text className="text-base font-bold text-text mb-3">Dirección de destino</Text>
        <View className="flex-row items-start mb-3">
          <Flag size={20} color={appColors.mapDestination} className="mr-2 mt-0.5" />
          <Text className="text-sm text-text flex-1">{order.destAddress}</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <User size={16} color={appColors.textMuted} className="mr-2" />
          <Text className="text-sm text-text">{order.destName}</Text>
        </View>
        <View className="flex-row items-center">
          <Phone size={16} color={appColors.textMuted} className="mr-2" />
          <Text className="text-sm text-text">{order.destPhone}</Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4 border border-border mb-4">
        <Text className="text-base font-bold text-text mb-3">Detalles del paquete</Text>
        <View className="flex-row items-center mb-2">
          <Package size={16} color={appColors.textMuted} className="mr-2" />
          <Text className="text-sm text-text">{order.packageDescription}</Text>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-xs text-text/60 mb-1">Tamaño</Text>
            <Text className="text-sm font-medium text-text capitalize">{order.packageSize}</Text>
          </View>
          {order.packageWeight && (
            <View className="flex-1">
              <Text className="text-xs text-text/60 mb-1">Peso</Text>
              <Text className="text-sm font-medium text-text">{order.packageWeight} kg</Text>
            </View>
          )}
          {order.packageDimensions && (
            <View className="flex-1">
              <Text className="text-xs text-text/60 mb-1">Dimensiones</Text>
              <Text className="text-sm font-medium text-text">{order.packageDimensions}</Text>
            </View>
          )}
        </View>
      </View>

      {order.productPaymentMode === 'cod' && order.productAmountMxn && (
        <View className="bg-white rounded-2xl p-4 border border-border mb-4">
          <Text className="text-base font-bold text-text mb-2">Pago contra entrega</Text>
          <Text className="text-2xl font-bold text-primary">${order.productAmountMxn} MXN</Text>
          <Text className="text-xs text-text/60 mt-1">El repartidor cobrará al entregar</Text>
        </View>
      )}

      <View className="bg-white rounded-2xl p-4 border border-border mb-4">
        <Text className="text-base font-bold text-text mb-3">Información del pedido</Text>
        <View className="flex-row items-center mb-2">
          <Clock size={16} color={appColors.textMuted} className="mr-2" />
          <Text className="text-sm text-text">Creado: {formatDateFull(order.createdAt)}</Text>
        </View>
        {order.deliveredAt && (
          <View className="flex-row items-center">
            <Clock size={16} color={appColors.success} className="mr-2" />
            <Text className="text-sm text-text">Entregado: {formatDateFull(order.deliveredAt)}</Text>
          </View>
        )}
        {showServiceFee && (
          <View className="flex-row items-center mt-2 pt-2 border-t border-border">
            <Text className="text-xs text-text/60 mr-2">Costo de servicio:</Text>
            <Text className="text-sm font-semibold text-primary">{order.serviceFee} créditos</Text>
          </View>
        )}
      </View>

      {order.deliveryEvidenceUrl && (
        <View className="bg-white rounded-2xl p-4 border border-border mb-6">
          <View className="flex-row items-center mb-3">
            <Camera size={18} color={appColors.textMuted} className="mr-2" />
            <Text className="text-base font-bold text-text">Evidencia de entrega</Text>
          </View>
          <View className="mb-3 rounded-xl overflow-hidden border border-border">
            <Image
              source={{ uri: order.deliveryEvidenceUrl }}
              className="w-full h-48"
              resizeMode="cover"
            />
          </View>
        </View>
      )}

      {order.deliveryReceiverName && (
        <View className="bg-white rounded-2xl p-4 border border-border mb-6">
          <Text className="text-base font-bold text-text mb-2">Receptor</Text>
          <Text className="text-sm text-text">
            {order.deliveryReceiverName}
            {order.deliveryReceiverName !== order.destName && (
              <Text className="text-text/60"> (diferente al destinatario)</Text>
            )}
          </Text>
          {order.deliveryReceiverRelation && (
            <Text className="text-xs text-text/60 mt-1 capitalize">
              Relación: {order.deliveryReceiverRelation}
            </Text>
          )}
          {order.deliveryNotes && (
            <Text className="text-xs text-text/70 mt-2 italic">"{order.deliveryNotes}"</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}