import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { API_BASE_URL } from '@/config/api';
import { SharedIncidentDetail, IncidentDetailLoader, IncidentDetailData } from '@/components/shared/SharedIncidentDetail';

interface DriverIncidentDetailScreenProps {
  route?: { params?: { incidentId?: number } };
  navigation: any;
}

export function DriverIncidentDetailScreen({ route, navigation }: DriverIncidentDetailScreenProps) {
  const [incident, setIncident] = useState<IncidentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncident = async () => {
    if (!route?.params?.incidentId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${route.params.incidentId}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setIncident(data);
      }
    } catch (err) {
      console.error('Error fetching incident:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [route?.params?.incidentId]);

  const handleOpenChat = async () => {
    if (!incident) return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat/orders/${incident.orderId}/channel`, {
        method: 'POST',
        credentials: 'include',
      });
      const channel = await res.json();
      if (channel?.id) {
        navigation.navigate('DeliveryChatConversation', {
          channelId: channel.id,
          orderPublicId: `#${incident.orderId}`,
        });
      }
    } catch {
      Alert.alert('Error', 'No se pudo abrir el chat');
    }
  };

  const handleNavigateToOrder = () => {
    if (!incident) return;
    navigation.navigate('DeliveryOrderFlow', { orderId: incident.orderId });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-3 pb-4 bg-surface border-b border-border">
        <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">MandaGo</Text>
        <Text className="text-2xl font-extrabold text-text mt-1">Mi incidencia</Text>
      </View>

      <IncidentDetailLoader isLoading={isLoading} incident={incident}>
        {(incidentData) => (
          <ScrollView className="flex-1 p-4">
            <SharedIncidentDetail incident={incidentData} onOrderPress={handleNavigateToOrder} />

            {incidentData.status !== 'resuelta' && (
              <View className="mt-4">
                <Pressable
                  onPress={handleOpenChat}
                  className="bg-primary rounded-xl p-4 flex-row items-center justify-center"
                >
                  <MessageCircle size={20} color="white" />
                  <Text className="text-base font-bold text-white ml-2">Abrir chat con cliente</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}
      </IncidentDetailLoader>
    </SafeAreaView>
  );
}