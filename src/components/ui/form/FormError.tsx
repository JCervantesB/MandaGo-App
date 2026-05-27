import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

export interface FormErrorProps {
  message: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

// Mensaje de error para formularios
export function FormError({
  message,
  icon,
  containerStyle,
}: FormErrorProps) {
  if (!message) return null;

  return (
    <View className={`flex-row items-center gap-2 py-2 ${containerStyle?.toString() ?? ''}`}>
      {icon && <View className="mr-1">{icon}</View>}
      <Text className="text-sm font-semibold text-error flex-1">{message}</Text>
    </View>
  );
}