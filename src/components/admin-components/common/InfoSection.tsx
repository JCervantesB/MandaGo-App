/**
 * Componente InfoSection
 * Muestra una sección con título y una card con filas de información
 */
import { View, Text } from 'react-native';

interface InfoRow {
  label: string;
  value: string;
}

interface InfoSectionProps {
  title: string;
  rows: InfoRow[];
  emptyMessage?: string;
}

// Sección con título y filas de información en tarjeta
export function InfoSection({ title, rows, emptyMessage }: InfoSectionProps) {
  const hasData = rows.some(row => row.value && row.value !== '-');

  return (
    <View className="mb-5">
      <Text className="text-lg font-bold text-text mb-3">{title}</Text>
      {hasData ? (
        <View className="bg-white rounded-xl p-4 gap-2.5">
          {rows.map((row, index) => (
            <View key={index} className="flex-row justify-between border-b border-border pb-2">
              <Text className="text-sm text-text/60">{row.label}</Text>
              <Text className="text-sm text-text font-medium flex-1 text-right ml-2" numberOfLines={2}>{row.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="bg-white rounded-xl p-6 items-center">
          <Text className="text-sm text-text/50">{emptyMessage || 'Sin datos'}</Text>
        </View>
      )}
    </View>
  );
}