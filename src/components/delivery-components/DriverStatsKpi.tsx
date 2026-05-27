import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { TrendingUp, Package, CreditCard, CheckCircle } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';

interface DriverStats {
  dayDelivered: number;
  dayEarnings: number;
  weekDelivered: number;
  weekEarnings: number;
  monthDelivered: number;
  monthEarnings: number;
}

interface DriverStatsKpiProps {
  onViewDetails?: () => void;
}

// Tarjeta de métricas del repartidor (entregados, ganancias por día/semana/mes)
export function DriverStatsKpi({ onViewDetails }: DriverStatsKpiProps) {
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');

  // Obtener estadísticas del repartidor al cargar el componente
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/driver/orders/stats`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching driver stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <View className="bg-surface rounded-2xl border border-border p-4 items-center">
        <ActivityIndicator color={appColors.primary} />
        <Text className="text-sm text-text-muted mt-2">Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View className="bg-surface rounded-2xl border border-border p-4 items-center">
        <Text className="text-sm text-text-muted">Sin datos disponibles</Text>
      </View>
    );
  }

  const delivered = activeTab === 'day' ? stats.dayDelivered : activeTab === 'week' ? stats.weekDelivered : stats.monthDelivered;
  const earnings = activeTab === 'day' ? stats.dayEarnings : activeTab === 'week' ? stats.weekEarnings : stats.monthEarnings;

  return (
    <View className="bg-surface rounded-2xl border border-border p-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={20} color={appColors.primary} />
          <Text className="text-base font-bold text-text">Mis Estadísticas</Text>
        </View>
        <View className="flex-row bg-background rounded-lg p-1">
          {(['day', 'week', 'month'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md ${activeTab === tab ? 'bg-primary' : ''}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === tab ? 'text-white' : 'text-text-muted'}`}>
                {tab === 'day' ? 'Día' : tab === 'week' ? 'Semana' : 'Mes'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-lg bg-success/10 items-center justify-center">
              <CheckCircle size={16} color={appColors.success} />
            </View>
            <Text className="text-xs text-text-muted">Entregas</Text>
          </View>
          <Text className="text-3xl font-extrabold text-text">{delivered}</Text>
          <Text className="text-xs text-text-muted mt-1">
            {activeTab === 'day' ? 'Hoy' : activeTab === 'week' ? 'Esta semana' : 'Este mes'}
          </Text>
        </View>

        <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
              <CreditCard size={16} color={appColors.primary} />
            </View>
            <Text className="text-xs text-text-muted">Ingresos</Text>
          </View>
          <Text className="text-3xl font-extrabold text-text">{earnings}</Text>
          <Text className="text-xs text-success font-medium mt-1">créditos ganados</Text>
        </View>
      </View>

      {onViewDetails && (
        <Pressable onPress={onViewDetails} className="flex-row items-center justify-center mt-4 py-2">
          <Text className="text-sm text-primary font-medium">Ver historial completo</Text>
        </Pressable>
      )}
    </View>
  );
}