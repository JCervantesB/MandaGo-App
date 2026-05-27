import React from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { ShipmentFormData } from '@/types/shipment-types';
import { appColors } from '@/theme/theme';

interface PackageStepProps {
  formData: ShipmentFormData;
  onChange: (data: Partial<ShipmentFormData>) => void;
}

const SIZE_OPTIONS = [
  { label: 'Chico', value: 'chico' },
  { label: 'Mediano', value: 'mediano' },
  { label: 'Grande', value: 'grande' },
] as const;

const PRIORITY_OPTIONS = [
  { label: 'Normal', value: 'normal', color: '#2563EB', bg: '#DBEAFE' },
  { label: 'Express', value: 'express', color: '#D97706', bg: '#FEF3C7' },
  { label: 'Urgente', value: 'urgente', color: '#DC2626', bg: '#FEE2E2' },
] as const;

// Step de creación de envío para datos del paquete (descripción, tamaño, prioridad)
export function PackageStep({ formData, onChange }: PackageStepProps) {
  return (
    <ScrollView
      className="px-4 py-3"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-base font-semibold text-text mb-3">¿Qué envías?</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">Descripción</Text>
        <TextInput
          className="bg-white border border-border rounded-xl px-4 py-3.5 text-base text-text"
          placeholder="Ej: Caja con documentos"
          placeholderTextColor={appColors.textSoft}
          value={formData.packageDescription}
          onChangeText={(text) => onChange({ packageDescription: text })}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">Peso (kg)</Text>
        <TextInput
          className="bg-white border border-border rounded-xl px-4 py-3.5 text-base text-text"
          placeholder="0.0"
          placeholderTextColor={appColors.textSoft}
          keyboardType="decimal-pad"
          value={formData.packageWeight ? formData.packageWeight.toString() : ''}
          onChangeText={(text) => onChange({ packageWeight: parseFloat(text) || 0 })}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">Tamaño</Text>
        <View className="flex-row gap-2">
          {SIZE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onChange({ packageSize: option.value })}
              className={`flex-1 py-3 rounded-xl border ${
                formData.packageSize === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-white'
              }`}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  formData.packageSize === option.value ? 'text-primary' : 'text-text'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">Dimensiones (opcional)</Text>
        <TextInput
          className="bg-white border border-border rounded-xl px-4 py-3.5 text-base text-text"
          placeholder="Ej: 30x20x15 cm"
          placeholderTextColor={appColors.textSoft}
          value={formData.packageDimensions || ''}
          onChangeText={(text) => onChange({ packageDimensions: text })}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-1.5">Prioridad</Text>
        <View className="flex-row gap-2">
          {PRIORITY_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onChange({ priority: option.value })}
              className={`flex-1 py-3 rounded-xl border ${
                formData.priority === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-white'
              }`}
            >
              <View
                className="px-2 py-0.5 rounded-full self-center mb-1"
                style={{ backgroundColor: option.bg }}
              >
                <Text className="text-xs font-semibold" style={{ color: option.color }}>
                  {option.label}
                </Text>
              </View>
              <Text
                className={`text-center text-xs font-medium ${
                  formData.priority === option.value ? 'text-primary' : 'text-text'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}