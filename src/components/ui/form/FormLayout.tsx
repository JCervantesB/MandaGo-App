import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';

export interface FormLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

// Layout base para formularios con título, subtítulo y scroll opcional
export function FormLayout({
  title,
  subtitle,
  children,
  scrollable = true,
  style,
}: FormLayoutProps) {
  const content = (
    <View className={`flex-1 p-5 gap-3 bg-background${style?.toString() ?? ''}`}>
      {title && <Text className="text-xl font-bold text-text">{title}</Text>}
      {subtitle && <Text className="text-base text-text/85">{subtitle}</Text>}
      <View className="gap-3">{children}</View>
    </View>
  );

  if (scrollable) {
    return (
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerClassName="flex-grow-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {content}
    </KeyboardAvoidingView>
  );
}