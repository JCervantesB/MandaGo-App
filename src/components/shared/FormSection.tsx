import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

// Sección de formulario con título y descripción
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <View className="gap-1">
      <Text className="text-base font-bold text-text">{title}</Text>
      {description && (
        <Text className="text-sm text-text-muted">{description}</Text>
      )}
      <View className="mt-3">{children}</View>
    </View>
  );
}