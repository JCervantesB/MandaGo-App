import { Text, View } from 'react-native';
import { Package } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  message: string;
}

// Estado vacío con icono y mensaje para cuando no hay datos
export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="bg-surface border border-border rounded-2xl py-12 px-6 items-center">
      <Package size={40} color="#9CA3AF" className="mb-3" />
      <Text className="text-base font-semibold text-text mb-1">{title}</Text>
      <Text className="text-sm text-text-muted text-center leading-5">{message}</Text>
    </View>
  );
}