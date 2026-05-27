import { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ClipboardList } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomNavAdmin } from '@/components/admin-components/BottomNavAdmin';
import { incidentStatusLabels, incidentStatusColors } from '@/data/incident-catalog';
import { getIncidentCatalogItem } from '@/hooks/use-incidents';
import { formatDateTime } from '@/utils/date-formatters';
import { API_BASE_URL } from '@/config/api';
import { appColors } from '@/theme/theme';
import type { AdminStackParamList } from '@/navigation/types';
import type { IncidentListItem } from '@/types/incident';

interface IncidentsAdminScreenProps {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'IncidentsAdmin'>;
}

export function IncidentsAdminScreen({ navigation }: IncidentsAdminScreenProps) {
  const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/incidents`;
      const params: string[] = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar incidencias');
      const responseData = await response.json();
      setIncidents(responseData ?? []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const filteredIncidents = incidents.filter((i) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(lower) ||
      i.code.toLowerCase().includes(lower) ||
      i.creatorName?.toLowerCase().includes(lower) ||
      i.orderId.toString().includes(lower)
    );
  });

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="px-5 pt-3 pb-4 bg-surface border-b border-border">
          <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">MandaGo</Text>
          <Text className="text-3xl font-extrabold text-text mt-1">Incidencias</Text>
        </View>

        <View className="px-5 py-3 bg-surface border-b border-border">
          <View className="flex-row items-center bg-white border border-border rounded-xl px-3 py-2 mb-2">
            <Search size={18} color={appColors.textMuted} className="mr-2" />
            <TextInput
              className="flex-1 text-sm text-text"
              placeholder="Buscar por título, código o cliente..."
              placeholderTextColor={appColors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} className="ml-2">
                <Text className="text-xs text-text/60">✕</Text>
              </Pressable>
            )}
          </View>

          <View className="flex-row gap-1">
            {['', 'abierta', 'en_proceso', 'resuelta'].map((status) => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`flex-1 px-2 py-2 rounded-full border text-center ${
                  statusFilter === status
                    ? 'bg-primary border-primary'
                    : 'bg-white border-border'
                }`}
              >
                <Text
                  className={`text-xs font-medium text-center ${
                    statusFilter === status ? 'text-white' : 'text-text'
                  }`}
                >
                  {status === '' ? 'Todas' : incidentStatusLabels[status]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color={appColors.primary} />
            <Text className="text-sm text-text/60 mt-3">Cargando incidencias...</Text>
          </View>
        ) : filteredIncidents.length === 0 ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="w-16 h-16 rounded-full bg-border items-center justify-center mb-3">
              <ClipboardList size={32} color={appColors.textMuted} />
            </View>
            <Text className="text-base font-semibold text-text mb-1">
              {search || statusFilter ? 'Sin resultados' : 'Sin incidencias'}
            </Text>
            <Text className="text-sm text-text/60 text-center">
              {search || statusFilter
                ? 'No hay incidencias que coincidan con tu búsqueda.'
                : 'Aún no hay incidencias reportadas.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredIncidents}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => {
              const catalogItem = getIncidentCatalogItem(item.code);
              const statusColor = incidentStatusColors[item.status] ?? '#6B7280';
              return (
                <Pressable
                  onPress={() => navigation.navigate('IncidentDetail', { incidentId: item.id })}
                  className="bg-white rounded-xl p-4 border border-border mb-2"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-xs font-medium text-primary">{item.code}</Text>
                      <Text className="text-sm font-semibold text-text">{catalogItem?.title ?? item.title}</Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: statusColor + '20' }}
                    >
                      <Text className="text-xs font-medium" style={{ color: statusColor }}>
                        {incidentStatusLabels[item.status]}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-text/60 mb-1">
                    Orden #{item.orderPublicId ?? item.orderId} • Reportada por {item.creatorName ?? 'N/A'}
                  </Text>
                  <Text className="text-xs text-text/50">{formatDateTime(item.createdAt)}</Text>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>

      <BottomNavAdmin activeScreen="IncidentsAdmin" navigation={navigation} />
    </View>
  );
}