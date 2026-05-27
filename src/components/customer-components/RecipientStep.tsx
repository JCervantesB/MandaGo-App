import React from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { ShipmentFormData } from '@/types/shipment-types';
import { appColors } from '@/theme/theme';

interface RecipientStepProps {
  formData: ShipmentFormData;
  onChange: (data: Partial<ShipmentFormData>) => void;
}

const PRODUCT_TYPE_OPTIONS = [
  { label: 'Sin costo', value: 'sin_costo' },
  { label: 'Contra entrega', value: 'contra_entrega' },
] as const;

// Step de creación de envío para datos del destinatario (nombre, teléfono, dirección)
export function RecipientStep({ formData, onChange }: RecipientStepProps) {
  return (
    <ScrollView
      className="px-4 py-3"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-base font-semibold text-text mb-3">¿Quién recibe?</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">Nombre completo</Text>
        <TextInput
          className="bg-white border border-border rounded-xl px-4 py-3.5 text-base text-text"
          placeholder="Nombre del destinatario"
          placeholderTextColor={appColors.textSoft}
          value={formData.destName}
          onChangeText={(text) => onChange({ destName: text })}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">Teléfono</Text>
        <TextInput
          className="bg-white border border-border rounded-xl px-4 py-3.5 text-base text-text"
          placeholder="+52 55 1234 5678"
          placeholderTextColor={appColors.textSoft}
          keyboardType="phone-pad"
          value={formData.destPhone}
          onChangeText={(text) => onChange({ destPhone: text })}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">¿Requieres pago contra entrega?</Text>
        <View className="flex-row gap-2">
          {PRODUCT_TYPE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onChange({ productType: option.value })}
              className={`flex-1 py-3 rounded-xl border ${
                formData.productType === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-white'
              }`}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  formData.productType === option.value ? 'text-primary' : 'text-text'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {formData.productType === 'contra_entrega' && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-text mb-1.5">Monto del producto (MXN)</Text>
          <TextInput
            className="bg-white border border-border rounded-xl px-4 py-3.5 text-base text-text"
            placeholder="0.00"
            placeholderTextColor={appColors.textSoft}
            keyboardType="decimal-pad"
            value={formData.productAmount ? formData.productAmount.toString() : ''}
            onChangeText={(text) => onChange({ productAmount: parseFloat(text) || 0 })}
          />
        </View>
      )}

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">Notas (opcional)</Text>
        <TextInput
          className="bg-white border border-border rounded-xl px-4 py-3.5 text-base text-text min-h-20"
          placeholder="Instrucciones especiales..."
          placeholderTextColor={appColors.textSoft}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={formData.notes}
          onChangeText={(text) => onChange({ notes: text })}
        />
      </View>
    </ScrollView>
  );
}