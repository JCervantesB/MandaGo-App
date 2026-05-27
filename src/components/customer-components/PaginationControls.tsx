import { Pressable, Text, View } from 'react-native';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

// Controles de paginación para navegar entre páginas
export function PaginationControls({
  currentPage,
  totalPages,
  isLoading,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <View className="flex-row justify-center items-center gap-3 pt-3">
      <Pressable
        onPress={onPrevious}
        disabled={!hasPrevious || isLoading}
        className={`py-2.5 px-4 rounded-xl ${hasPrevious ? 'bg-primary' : 'bg-border'}`}
      >
        <Text className={`text-sm font-semibold ${hasPrevious ? 'text-white' : 'text-text/50'}`}>
          Anterior
        </Text>
      </Pressable>

      <Text className="text-sm text-text font-medium">
        {currentPage} / {totalPages}
      </Text>

      <Pressable
        onPress={onNext}
        disabled={!hasNext || isLoading}
        className={`py-2.5 px-4 rounded-xl ${hasNext ? 'bg-primary' : 'bg-border'}`}
      >
        <Text className={`text-sm font-semibold ${hasNext ? 'text-white' : 'text-text/50'}`}>
          Siguiente
        </Text>
      </Pressable>
    </View>
  );
}