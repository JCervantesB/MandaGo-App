import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  containerStyle?: ViewStyle;
}

// Sección de formulario con título y descripción
export function FormSection({
  title,
  children,
  description,
  containerStyle,
}: FormSectionProps) {
  return (
    <View className={`gap-2 ${containerStyle?.toString() ?? ''}`}>
      <View className="pb-2 border-b border-border">
        <Text className="text-base font-bold text-text">{title}</Text>
        {description && <Text className="text-sm text-text/70 mt-1">{description}</Text>}
      </View>
      <View className="gap-4 pt-2">{children}</View>
    </View>
  );
}