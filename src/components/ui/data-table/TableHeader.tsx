import { Text, View } from 'react-native';
import { appColors } from '@/theme/theme';

export interface TableColumn<TItem> {
  key: keyof TItem;
  header: string;
  width?: number;
  flex?: number;
  render?: (item: TItem) => React.ReactNode;
}

interface TableHeaderProps<TItem> {
  columns: TableColumn<TItem>[];
  backgroundColor?: string;
}

// Encabezado de columna para la tabla de datos
export function TableHeader<TItem>({
  columns,
  backgroundColor = appColors.textMuted,
}: TableHeaderProps<TItem>) {
  return (
    <View className="flex-row items-center py-3 px-3" style={{ backgroundColor }}>
      {columns.map((column) => (
        <View
          key={String(column.key)}
          className="px-0.5"
          style={[
            column.width ? { width: column.width } : {},
            column.flex ? { flex: column.flex } : { flex: 1 },
          ]}
        >
          <Text className="text-xs font-bold text-white uppercase tracking-wider">{column.header}</Text>
        </View>
      ))}
    </View>
  );
}