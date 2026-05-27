import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useClientsList } from '@/hooks/use-clients-list';
import { DataTable, TableColumn } from '@/components/ui/data-table';
import type { RootStackParamList } from '@/navigation/types';
import type { Client } from '@/types/admin.types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ClientsDisabledProps {
  onDataLoaded?: (count: number) => void;
}
// Columnas de la tabla de clientes deshabilitados
const columns: TableColumn<Client>[] = [
  {
    key: 'name',
    header: 'Cliente',
    flex: 1,
    render: (item) => (
      <View className="flex-1 min-w-0 pr-3 justify-center">
        <Text className="text-sm font-bold text-text flex-shrink min-w-0" numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text className="text-xs text-text/70 mt-0.5 flex-shrink min-w-0" numberOfLines={1} ellipsizeMode="middle">
          {item.email}
        </Text>
      </View>
    ),
  },
  {
    key: 'phone',
    header: 'Teléfono',
    width: 96,
    render: (item) => (
      <Text className="w-24 text-xs text-text text-center px-2" numberOfLines={1} ellipsizeMode="tail">
        {item.phone || '—'}
      </Text>
    ),
  },
  {
    key: 'createdAt',
    header: 'Alta',
    width: 74,
    render: (item) => (
      <Text className="w-[74px] text-xs text-text/75 text-right">
        {new Date(item.createdAt).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </Text>
    ),
  },
];

// Lista de clientes deshabilitados con tabla de datos
export function ClientsDisabled({ onDataLoaded }: ClientsDisabledProps) {
  const navigation = useNavigation<NavigationProp>();
  const {
    clients,
    isLoading,
    pagination,
    fetchPage,
    goToNextPage,
    goToPreviousPage,
  } = useClientsList({ status: 'disabled' });

  useEffect(() => {
    fetchPage(1);
  }, []);

  useEffect(() => {
    onDataLoaded?.(pagination.totalItems);
  }, [pagination.totalItems, onDataLoaded]);

  const handleRowPress = (item: Client) => {
    navigation.navigate('ClientDetailAdmin', { userId: item.id });
  };

  const hasPreviousPage = pagination.currentPage > 1;
  const hasNextPage = pagination.currentPage < pagination.totalPages;

  return (
    <View className="flex-1 px-3 pt-3">
      <Text className="text-lg font-bold text-text mb-1">Clientes deshabilitados</Text>
      <Text className="text-sm text-text/65 mb-3">
        {pagination.totalItems > 0
          ? `${pagination.totalItems} deshabilitados`
          : 'Cargando...'}
      </Text>

      <DataTable
        data={clients}
        columns={columns}
        onRowPress={handleRowPress}
        pagination={{
          currentPage: pagination.currentPage,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
        }}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        isLoading={isLoading}
        emptyMessage="No hay clientes deshabilitados"
      />
    </View>
  );
}