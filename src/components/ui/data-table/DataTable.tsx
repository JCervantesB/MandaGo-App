import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { TableHeader, type TableColumn } from './TableHeader';
import { TableRow } from './TableRow';
import { PaginationControls } from './PaginationControls';
import { appColors } from '@/theme/theme';

export interface PaginationState {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

interface DataTableProps<TItem extends { id: string }> {
  data: TItem[];
  columns: TableColumn<TItem>[];
  onRowPress?: (item: TItem) => void;
  pagination?: PaginationState;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  keyExtractor?: (item: TItem) => string;
}

// Tabla de datos con columnas configurables y paginación
export function DataTable<TItem extends { id: string }>({
  data,
  columns,
  onRowPress,
  pagination,
  hasPreviousPage = false,
  hasNextPage = false,
  onPreviousPage,
  onNextPage,
  isLoading = false,
  emptyMessage = 'No hay datos disponibles',
  keyExtractor = (item) => item.id,
}: DataTableProps<TItem>) {
  const renderItem = ({ item, index }: { item: TItem; index: number }) => (
    <TableRow
      item={item}
      columns={columns}
      onPress={onRowPress}
      isEven={index % 2 === 0}
    />
  );

  const renderHeader = () => <TableHeader columns={columns} />;

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-10">
      {isLoading ? (
        <ActivityIndicator color={appColors.primary} size="large" />
      ) : (
        <Text className="text-base text-disabled text-center">{emptyMessage}</Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white rounded-lg overflow-hidden border border-border">
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        contentContainerClassName={data.length === 0 ? 'flex-1' : undefined}
      />

      {pagination && (hasPreviousPage || hasNextPage) && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPreviousPage={onPreviousPage!}
          onNextPage={onNextPage!}
          isLoading={isLoading}
        />
      )}
    </View>
  );
}