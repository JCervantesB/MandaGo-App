import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Package, CheckCircle, Truck, CreditCard, TrendingUp } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';

interface CustomerStats {
  weekTotal: number;
  monthTotal: number;
  weekDelivered: number;
  monthDelivered: number;
  weekSpent: number;
  monthSpent: number;
  weekActive: number;
  monthActive: number;
}

interface CustomerStatsKpiProps {
  onViewDetails?: () => void;
}

// Tarjeta de métricas del cliente (envíos totales, entregados, activos y gastado)
export function CustomerStatsKpi({ onViewDetails }: CustomerStatsKpiProps) {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/customer/stats`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching customer stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <View className="bg-surface rounded-2xl border border-border p-5 items-center">
        <ActivityIndicator color={appColors.primary} />
        <Text className="text-sm text-text-muted mt-2">Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View className="bg-surface rounded-2xl border border-border p-5 items-center">
        <Text className="text-sm text-text-muted">Sin datos disponibles</Text>
      </View>
    );
  }

  const total = activeTab === 'week' ? stats.weekTotal : stats.monthTotal;
  const delivered = activeTab === 'week' ? stats.weekDelivered : stats.monthDelivered;
  const spent = activeTab === 'week' ? stats.weekSpent : stats.monthSpent;
  const inProcess = activeTab === 'week' ? stats.weekActive : stats.monthActive;

  return (
    <View className="bg-surface rounded-2xl border border-border p-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={20} color={appColors.primary} />
          <Text className="text-base font-bold text-text">Mis Estadísticas</Text>
        </View>
        <View className="flex-row bg-background rounded-lg p-1">
          <Pressable
            onPress={() => setActiveTab('week')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'week' ? 'bg-primary' : ''}`}
          >
            <Text className={`text-xs font-semibold ${activeTab === 'week' ? 'text-white' : 'text-text-muted'}`}>
              Semana
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('month')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'month' ? 'bg-primary' : ''}`}
          >
            <Text className={`text-xs font-semibold ${activeTab === 'month' ? 'text-white' : 'text-text-muted'}`}>
              Mes
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
              <Package size={16} color={appColors.primary} />
            </View>
            <Text className="text-xs text-text-muted">Total envíos</Text>
          </View>
          <Text className="text-3xl font-extrabold text-text">{total}</Text>
          <Text className="text-xs text-text-muted mt-1">
            {activeTab === 'week' ? 'Esta semana' : 'Este mes'}
          </Text>
        </View>

        <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-lg bg-success/10 items-center justify-center">
              <CheckCircle size={16} color={appColors.success} />
            </View>
            <Text className="text-xs text-text-muted">Entregados</Text>
          </View>
          <Text className="text-3xl font-extrabold text-text">{delivered}</Text>
          <Text className="text-xs text-success font-medium mt-1">
            {total > 0 ? Math.round((delivered / total) * 100) : 0}% del total
          </Text>
        </View>

        <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-lg bg-yellow-100 items-center justify-center">
              <Truck size={16} color="#D97706" />
            </View>
            <Text className="text-xs text-text-muted">En proceso</Text>
          </View>
          <Text className="text-3xl font-extrabold text-text">{inProcess}</Text>
          <Text className="text-xs text-text-muted mt-1">Activos actualmente</Text>
        </View>

        <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-lg bg-red-100 items-center justify-center">
              <CreditCard size={16} color="#DC2626" />
            </View>
            <Text className="text-xs text-text-muted">Gastado</Text>
          </View>
          <Text className="text-3xl font-extrabold text-text">{spent}</Text>
          <Text className="text-xs text-text-muted mt-1">créditos</Text>
        </View>
      </View>

      {onViewDetails && (
        <Pressable onPress={onViewDetails} className="flex-row items-center justify-center mt-4 py-2">
          <Text className="text-sm text-primary font-medium">Ver detalle de envíos</Text>
        </Pressable>
      )}
    </View>
  );
}