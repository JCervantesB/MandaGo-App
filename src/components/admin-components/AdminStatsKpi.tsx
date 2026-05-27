import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AlertTriangle, Users, DollarSign, TrendingUp, Truck, CheckCircle, XCircle } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';

interface AdminStats {
  orders: {
    dayTotal: number;
    dayActive: number;
    dayDelivered: number;
    dayCancelled: number;
    weekTotal: number;
    weekActive: number;
    weekDelivered: number;
    weekCancelled: number;
    monthTotal: number;
    monthActive: number;
    monthDelivered: number;
    monthCancelled: number;
    total: number;
  };
  incidents: {
    dayOpen: number;
    weekOpen: number;
    monthOpen: number;
    dayClosed: number;
    weekClosed: number;
    monthClosed: number;
    totalOpen: number;
    totalClosed: number;
  };
  users: {
    clients: number;
    drivers: number;
  };
  revenue: {
    dayTotal: number;
    weekTotal: number;
    monthTotal: number;
  };
}

interface AdminStatsKpiProps {
  onViewDetails?: () => void;
}

type TimeTab = 'day' | 'week' | 'month';

// Tarjeta de métricas generales del admin (órdenes, incidentes, usuarios, ingresos)
export function AdminStatsKpi({ onViewDetails }: AdminStatsKpiProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'incidents' | 'users'>('orders');
  const [timeTab, setTimeTab] = useState<TimeTab>('day');

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/stats`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError(`Status: ${response.status}`);
        }
      } catch (err) {
        console.error('[AdminStatsKpi] Error fetching admin stats:', err);
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
        {error && <Text className="text-xs text-red-500 mt-2">{error}</Text>}
      </View>
    );
  }

  const getOrdersData = () => {
    switch (timeTab) {
      case 'day':
        return { total: stats.orders.dayTotal, active: stats.orders.dayActive, delivered: stats.orders.dayDelivered, cancelled: stats.orders.dayCancelled };
      case 'week':
        return { total: stats.orders.weekTotal, active: stats.orders.weekActive, delivered: stats.orders.weekDelivered, cancelled: stats.orders.weekCancelled };
      case 'month':
        return { total: stats.orders.monthTotal, active: stats.orders.monthActive, delivered: stats.orders.monthDelivered, cancelled: stats.orders.monthCancelled };
    }
  };

  const getIncidentsData = () => {
    switch (timeTab) {
      case 'day':
        return { open: stats.incidents.dayOpen, closed: stats.incidents.dayClosed };
      case 'week':
        return { open: stats.incidents.weekOpen, closed: stats.incidents.weekClosed };
      case 'month':
        return { open: stats.incidents.monthOpen, closed: stats.incidents.monthClosed };
    }
  };

  const getRevenue = () => {
    switch (timeTab) {
      case 'day': return stats.revenue.dayTotal;
      case 'week': return stats.revenue.weekTotal;
      case 'month': return stats.revenue.monthTotal;
    }
  };

  const ordersData = getOrdersData();
  const incidentsData = getIncidentsData();

  return (
    <View className="bg-surface rounded-2xl border border-border p-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={20} color={appColors.primary} />
          <Text className="text-base font-bold text-text">Métricas Generales</Text>
        </View>
        <View className="flex-row bg-background rounded-lg p-1">
          {(['day', 'week', 'month'] as TimeTab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setTimeTab(tab)}
              className={`px-3 py-1.5 rounded-md ${timeTab === tab ? 'bg-primary' : ''}`}
            >
              <Text className={`text-xs font-semibold ${timeTab === tab ? 'text-white' : 'text-text-muted'}`}>
                {tab === 'day' ? 'Día' : tab === 'week' ? 'Semana' : 'Mes'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-row bg-background rounded-lg p-1 mb-4">
        <Pressable
          onPress={() => setActiveTab('orders')}
          className={`flex-1 py-2 rounded-md ${activeTab === 'orders' ? 'bg-primary' : ''}`}
        >
          <Text className={`text-xs font-semibold text-center ${activeTab === 'orders' ? 'text-white' : 'text-text-muted'}`}>
            Órdenes
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('incidents')}
          className={`flex-1 py-2 rounded-md ${activeTab === 'incidents' ? 'bg-primary' : ''}`}
        >
          <Text className={`text-xs font-semibold text-center ${activeTab === 'incidents' ? 'text-white' : 'text-text-muted'}`}>
            Incidencias
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('users')}
          className={`flex-1 py-2 rounded-md ${activeTab === 'users' ? 'bg-primary' : ''}`}
        >
          <Text className={`text-xs font-semibold text-center ${activeTab === 'users' ? 'text-white' : 'text-text-muted'}`}>
            Usuarios
          </Text>
        </Pressable>
      </View>

      {activeTab === 'orders' && (
        <View className="flex-row flex-wrap gap-3">
          <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                <DollarSign size={16} color={appColors.primary} />
              </View>
              <Text className="text-xs text-text-muted">Ingresos</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">{getRevenue().toLocaleString('es-MX')}</Text>
            <Text className="text-xs text-text-muted mt-1">créditos</Text>
          </View>

          <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-lg bg-yellow-100 items-center justify-center">
                <Truck size={16} color="#D97706" />
              </View>
              <Text className="text-xs text-text-muted">Activas</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">{ordersData.active}</Text>
            <Text className="text-xs text-text-muted mt-1">en proceso</Text>
          </View>

          <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-lg bg-success/10 items-center justify-center">
                <CheckCircle size={16} color={appColors.success} />
              </View>
              <Text className="text-xs text-text-muted">Entregadas</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">{ordersData.delivered}</Text>
            <Text className="text-xs text-success mt-1">
              {ordersData.total > 0 ? Math.round((ordersData.delivered / ordersData.total) * 100) : 0}% del total
            </Text>
          </View>

          <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-lg bg-red-100 items-center justify-center">
                <XCircle size={16} color="#DC2626" />
              </View>
              <Text className="text-xs text-text-muted">Canceladas</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">{ordersData.cancelled}</Text>
            <Text className="text-xs text-text-muted mt-1">total canceladas</Text>
          </View>
        </View>
      )}

      {activeTab === 'incidents' && (
        <View className="flex-row flex-wrap gap-3">
          <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-lg bg-red-100 items-center justify-center">
                <AlertTriangle size={16} color="#DC2626" />
              </View>
              <Text className="text-xs text-text-muted">Abiertas</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">{incidentsData.open}</Text>
            <Text className="text-xs text-text-muted mt-1">requieren atención</Text>
          </View>

          <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-lg bg-success/10 items-center justify-center">
                <CheckCircle size={16} color={appColors.success} />
              </View>
              <Text className="text-xs text-text-muted">Resueltas</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">{incidentsData.closed}</Text>
            <Text className="text-xs text-text-muted mt-1">historico</Text>
          </View>
        </View>
      )}

      {activeTab === 'users' && (
        <View className="flex-row flex-wrap gap-3">
          <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-lg bg-blue-100 items-center justify-center">
                <Users size={16} color="#2563EB" />
              </View>
              <Text className="text-xs text-text-muted">Clientes</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">{stats.users.clients}</Text>
            <Text className="text-xs text-text-muted mt-1">usuarios registrados</Text>
          </View>

          <View className="w-[48%] bg-background rounded-xl p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-lg bg-green-100 items-center justify-center">
                <Truck size={16} color={appColors.success} />
              </View>
              <Text className="text-xs text-text-muted">Repartidores</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">{stats.users.drivers}</Text>
            <Text className="text-xs text-text-muted mt-1">usuarios registrados</Text>
          </View>
        </View>
      )}

      {onViewDetails && (
        <Pressable onPress={onViewDetails} className="flex-row items-center justify-center mt-4 py-2">
          <Text className="text-sm text-primary font-medium">Ver detalle completo</Text>
        </Pressable>
      )}
    </View>
  );
}