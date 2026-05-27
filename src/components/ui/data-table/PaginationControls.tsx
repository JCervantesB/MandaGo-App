import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  isLoading?: boolean;
}

// Controles de paginación para tablas de datos
export function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  hasPreviousPage,
  hasNextPage,
  onPreviousPage,
  onNextPage,
  isLoading = false,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <View className="flex-row justify-center items-center gap-3 py-3 px-2">
      <Pressable
        onPress={onPreviousPage}
        disabled={!hasPreviousPage || isLoading}
        className={`py-2 px-4 rounded-lg min-w-24 items-center ${hasPreviousPage ? 'bg-primary' : 'bg-disabled/60'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className={`text-sm font-semibold ${hasPreviousPage ? 'text-white' : 'text-disabled'}`}>
            Anterior
          </Text>
        )}
      </Pressable>

      <Text className="text-sm text-text font-medium min-w-24 text-center">
        Página {currentPage} de {totalPages}
      </Text>

      <Pressable
        onPress={onNextPage}
        disabled={!hasNextPage || isLoading}
        className={`py-2 px-4 rounded-lg min-w-24 items-center ${hasNextPage ? 'bg-primary' : 'bg-disabled/60'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className={`text-sm font-semibold ${hasNextPage ? 'text-white' : 'text-disabled'}`}>
            Siguiente
          </Text>
        )}
      </Pressable>
    </View>
  );
}