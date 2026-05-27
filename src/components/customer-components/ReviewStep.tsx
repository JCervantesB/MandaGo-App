import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { MapPin, Navigation, Package, User, AlertTriangle } from 'lucide-react-native';
import { PlaceOption, ShipmentFormData } from '@/types/shipment-types';
import { appColors } from '@/theme/theme';

interface ReviewStepProps {
  origin: PlaceOption | null;
  destination: PlaceOption | null;
  formData: ShipmentFormData;
  routeInfo?: { distance: number; duration: number } | null;
  onEditStep: (step: 'addresses' | 'package' | 'recipient') => void;
}

const PRIORITY_LABELS = {
  normal: { label: 'Normal', color: '#2563EB', bg: '#DBEAFE' },
  express: { label: 'Express', color: '#D97706', bg: '#FEF3C7' },
  urgente: { label: 'Urgente', color: '#DC2626', bg: '#FEE2E2' },
} as const;

const SIZE_LABELS = {
  chico: 'Chico',
  mediano: 'Mediano',
  grande: 'Grande',
} as const;

// Step de revisión final antes de confirmar la creación del envío
export function ReviewStep({
  origin,
  destination,
  formData,
  routeInfo,
  onEditStep,
}: ReviewStepProps) {
  const priorityConfig = PRIORITY_LABELS[formData.priority ?? 'normal'];

  return (
    <ScrollView
      className="px-4 py-3"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-base font-semibold text-text mb-3">Resumen del envío</Text>

      <Pressable
        onPress={() => onEditStep('addresses')}
        className="bg-white rounded-xl p-4 border border-border mb-3"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <MapPin size={16} color={appColors.success} />
            <Text className="text-sm font-semibold text-text ml-2">Direcciones</Text>
          </View>
          <Text className="text-xs text-primary font-medium">Editar</Text>
        </View>

        <View className="flex-row mb-2">
          <View className="w-2 h-2 rounded-full bg-success mt-1.5 mr-2" />
          <View className="flex-1">
            <Text className="text-xs text-textMuted">Desde</Text>
            <Text className="text-sm text-text">{origin?.formatted ?? 'No seleccionado'}</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="w-2 h-2 rounded-full bg-mapDestination mt-1.5 mr-2" />
          <View className="flex-1">
            <Text className="text-xs text-textMuted">Hasta</Text>
            <Text className="text-sm text-text">{destination?.formatted ?? 'No seleccionado'}</Text>
          </View>
        </View>

        {routeInfo && (
          <View className="mt-2 pt-2 border-t border-border flex-row items-center">
            <Navigation size={12} color={appColors.textMuted} />
            <Text className="text-xs text-textMuted ml-1">
              {(routeInfo.distance / 1000).toFixed(1)} km • {Math.round(routeInfo.duration / 60)} min
            </Text>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={() => onEditStep('package')}
        className="bg-white rounded-xl p-4 border border-border mb-3"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Package size={16} color={appColors.primary} />
            <Text className="text-sm font-semibold text-text ml-2">Paquete</Text>
          </View>
          <Text className="text-xs text-primary font-medium">Editar</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-text">{formData.packageDescription || 'Sin descripción'}</Text>
            <Text className="text-xs text-textMuted mt-0.5">
              {SIZE_LABELS[formData.packageSize ?? 'chico']} • {formData.packageWeight ?? 0} kg
              {formData.packageDimensions ? ` • ${formData.packageDimensions}` : ''}
            </Text>
          </View>
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: priorityConfig.bg }}
          >
            <Text className="text-xs font-semibold" style={{ color: priorityConfig.color }}>
              {priorityConfig.label}
            </Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={() => onEditStep('recipient')}
        className="bg-white rounded-xl p-4 border border-border mb-3"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <User size={16} color={appColors.textMuted} />
            <Text className="text-sm font-semibold text-text ml-2">Destinatario</Text>
          </View>
          <Text className="text-xs text-primary font-medium">Editar</Text>
        </View>

        <View>
          <Text className="text-sm text-text">{formData.destName || 'Sin nombre'}</Text>
          <Text className="text-xs text-textMuted mt-0.5">{formData.destPhone || 'Sin teléfono'}</Text>
        </View>

        {formData.productType === 'contra_entrega' && formData.productAmount && (
          <View className="mt-2 pt-2 border-t border-border flex-row items-center">
            <AlertTriangle size={12} color={appColors.textMuted} />
            <Text className="text-xs text-textMuted ml-1">
              Pago contra entrega: ${formData.productAmount} MXN
            </Text>
          </View>
        )}
      </Pressable>

      {formData.notes && (
        <View className="bg-white rounded-xl p-4 border border-border">
          <Text className="text-sm font-semibold text-text mb-1">Notas</Text>
          <Text className="text-sm text-textMuted">{formData.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
}