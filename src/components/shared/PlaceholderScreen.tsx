import { Text, View } from 'react-native';
import { ClipboardList, LucideIcon } from 'lucide-react-native';

export interface PlaceholderScreenProps {
  title: string;
  message: string;
  icon?: LucideIcon;
}

const DefaultIcon = ClipboardList;

// Pantalla de marcador de posición con icono y mensaje
export function PlaceholderScreen({ title, message, icon: Icon = DefaultIcon }: PlaceholderScreenProps) {
  return (
    <View className="flex-1 justify-center items-center p-10 bg-background">
      <Icon size={48} color="#9CA3AF" className="mb-4" />
      <Text className="text-lg font-semibold text-text text-center mb-2">{title}</Text>
      <Text className="text-sm text-text/70 text-center">{message}</Text>
    </View>
  );
}