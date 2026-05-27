import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';
import { BottomNavDelivery } from '@/components/delivery-components/BottomNavDelivery';

interface DriverIncidentListScreenProps {
  navigation: any;
}

interface Incident {
  id: number;
  orderId: number;
  orderPublicId?: string;
  code: string;
  title: string;
  description: string;
  status: 'abierta' | 'en_proceso' | 'resuelta';
  createdAt: string;
  updatedAt: string;
}

export function DriverIncidentListScreen({ navigation }: DriverIncidentListScreenProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/driver/list`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIncidents();
    setRefreshing(false);
  };

  const openIncidents = incidents.filter(i => i.status === 'abierta' || i.status === 'en_proceso');
  const closedIncidents = incidents.filter(i => i.status === 'resuelta');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abierta': return appColors.error;
      case 'en_proceso': return '#D97706';
      case 'resuelta': return appColors.success;
      default: return appColors.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'abierta': return 'Abierta';
      case 'en_proceso': return 'En proceso';
      case 'resuelta': return 'Resuelta';
      default: return status;
    }
  };

  if (isLoading && incidents.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator color={appColors.primary} size="large" />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[appColors.primary]} />
          }
        >
          {openIncidents.length > 0 && (
            <View className="px-4 pt-4">
              <Text className="text-base font-bold text-text mb-3">Incidencias activas</Text>
              {openIncidents.map((incident) => (
                <Pressable
                  key={incident.id}
                  onPress={() => navigation.navigate('DriverIncidentDetail', { incidentId: incident.id })}
                  className="bg-white rounded-xl p-4 mb-3 border-l-4"
                  style={{ borderLeftWidth: 4, borderLeftColor: getStatusColor(incident.status) }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <AlertTriangle size={16} color={getStatusColor(incident.status)} />
                      <Text className="text-sm font-semibold ml-2" style={{ color: getStatusColor(incident.status) }}>
                        {incident.code}
                      </Text>
                    </View>
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: getStatusColor(incident.status) + '20' }}>
                      <Text className="text-xs font-semibold" style={{ color: getStatusColor(incident.status) }}>
                        {getStatusLabel(incident.status)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-bold text-text">{incident.title}</Text>
                  <Text className="text-sm text-text/70 mt-1" numberOfLines={2}>{incident.description}</Text>
                  <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <Text className="text-xs text-text/50">Orden #{incident.orderPublicId ?? incident.orderId}</Text>
                    <ChevronRight size={16} color={appColors.textMuted} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {closedIncidents.length > 0 && (
            <View className="px-4 pt-4">
              <Text className="text-base font-bold text-text mb-3">Historial de incidencias</Text>
              {closedIncidents.map((incident) => (
                <Pressable
                  key={incident.id}
                  onPress={() => navigation.navigate('DriverIncidentDetail', { incidentId: incident.id })}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <CheckCircle size={16} color={appColors.success} />
                      <Text className="text-sm font-semibold ml-2 text-text/60">{incident.code}</Text>
                    </View>
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: appColors.success + '20' }}>
                      <Text className="text-xs font-semibold" style={{ color: appColors.success }}>
                        Resuelta
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-semibold text-text">{incident.title}</Text>
                  <Text className="text-sm text-text/50 mt-1" numberOfLines={1}>{incident.description}</Text>
                  <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <Text className="text-xs text-text/50">Orden #{incident.orderPublicId ?? incident.orderId}</Text>
                    <ChevronRight size={16} color={appColors.textMuted} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {incidents.length === 0 && (
            <View className="flex-1 justify-center items-center pt-20">
              <CheckCircle size={48} color={appColors.success} />
              <Text className="text-base text-text/60 mt-4">Sin incidencias</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <BottomNavDelivery activeScreen="Home" navigation={navigation} />
    </View>
  );
}