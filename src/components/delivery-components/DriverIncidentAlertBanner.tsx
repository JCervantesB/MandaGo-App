import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';

interface OpenIncident {
  id: number;
  orderId: number;
  code: string;
  title: string;
  description: string;
  status: string;
}

interface DriverIncidentAlertBannerProps {
  onPress?: () => void;
}

// Banner de alerta para mostrar incidencias activas del repartidor
export function DriverIncidentAlertBanner({ onPress }: DriverIncidentAlertBannerProps) {
  const [openIncident, setOpenIncident] = useState<OpenIncident | null>(null);
  
  // Obtener incidencias activas del repartidor al cargar el componente
  useEffect(() => {
    const fetchOpenIncident = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/incidents/driver/list`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const openIncident = data.find((i: any) => i.status === 'abierta' || i.status === 'en_proceso');
          if (openIncident) {
            setOpenIncident(openIncident);
          } else {
            setOpenIncident(null);
          }
        }
      } catch (err) {
        console.error('Error fetching open incident:', err);
      }
    };

    fetchOpenIncident();
    const interval = setInterval(fetchOpenIncident, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!openIncident) return null;

  return (
    <Pressable
      onPress={onPress}
      className="bg-red-50 border border-red-200 rounded-xl p-3 mt-4 mx-4 flex-row items-center"
    >
      <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
        <AlertTriangle size={20} color={appColors.error} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-bold text-red-800">Incidencia activa</Text>
        <Text className="text-xs text-red-600" numberOfLines={1}>{openIncident.title}</Text>
      </View>
      <Text className="text-xs text-red-500 font-semibold">Ver</Text>
    </Pressable>
  );
}