import { Pressable, Text, View } from 'react-native';
import type { TableColumn } from './TableHeader';

export interface TableRowProps<TItem> {
  item: TItem;
  columns: TableColumn<TItem>[];
  onPress?: (item: TItem) => void;
  isEven: boolean;
}

// Fila de datos para la tabla con soporte para presionar y renderizado personalizado
export function TableRow<TItem extends { id: string }>({
  item,
  columns,
  onPress,
  isEven,
}: TableRowProps<TItem>) {
  const rowContent = (
    <View className={`flex-row items-center py-3 px-3 border-b border-border ${isEven ? 'bg-white' : 'bg-card'}`}>
      {columns.map((column) => (
        <View
          key={String(column.key)}
          className="px-0.5"
          style={[
            column.width ? { width: column.width } : {},
            column.flex ? { flex: column.flex } : { flex: 1 },
          ]}
        >
          {column.render ? (
            column.render(item)
          ) : (
            <Text className="text-sm text-text truncate" numberOfLines={1}>
              {String(item[column.key] ?? '')}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => pressed ? { backgroundColor: 'rgba(37, 99, 235, 0.15)' } : undefined}
      >
        {rowContent}
      </Pressable>
    );
  }

  return rowContent;
}