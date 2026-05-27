import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

export interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
}

// Campo de formulario con label, error y contenido
export function FormField({
  label,
  error,
  children,
  containerStyle,
  required = false,
}: FormFieldProps) {
  return (
    <View className={`gap-1 ${containerStyle?.toString() ?? ''}`}>
      <Text className="text-sm font-bold text-text">
        {label}
        {required && <Text className="text-error"> *</Text>}
      </Text>
      {children}
      {error && <Text className="text-xs text-error">{error}</Text>}
    </View>
  );
}