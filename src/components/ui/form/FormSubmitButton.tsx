import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface FormSubmitButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  title: string;
  style?: ViewStyle;
}

const variantStyles = {
  primary: 'bg-primary',
  secondary: 'bg-card border border-border',
  danger: 'bg-error',
};

const pressedStyles = {
  primary: 'active:bg-primary/90',
  secondary: 'active:bg-card/80',
  danger: 'active:bg-error/90',
};

const textStyles = {
  primary: 'text-white',
  secondary: 'text-text',
  danger: 'text-white',
};

// Botón de envío para formularios con estados de carga y variants
export function FormSubmitButton({
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  title,
  style,
}: FormSubmitButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`py-3.5 px-4 rounded-lg items-center justify-center min-h-12 ${variantStyles[variant]} ${pressedStyles[variant]} ${isDisabled ? 'opacity-70' : ''} ${style?.toString() ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={`text-base font-semibold ${textStyles[variant]}`}>{title}</Text>
      )}
    </Pressable>
  );
}