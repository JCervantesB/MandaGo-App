import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, Flag, Send } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomNavCustomer } from '@/components/customer-components/BottomNavCustomer';
import { OrderDetailContent } from '@/components/shared/OrderDetailContent';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import { API_BASE_URL } from '@/config/api';
import { appColors } from '@/theme/theme';
import type { CustomerShipment } from '@/types/shipment-types';
import type { ClientStackParamList } from '@/navigation/types';

interface ShipmentDetailScreenProps {
  route?: { params?: { shipmentId?: number } };
  navigation: NativeStackNavigationProp<ClientStackParamList, 'ClientShipmentDetail'>;
}

const TRACKING_STATUSES = ['recogido', 'en_entrega'];

export function ShipmentDetailScreen({ route, navigation }: ShipmentDetailScreenProps) {
  const shipmentId = route?.params?.shipmentId;
  const [shipment, setShipment] = useState<CustomerShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showTracking = shipment && TRACKING_STATUSES.includes(shipment.status);

  const { driverLocation, isConnected } = useTrackingSocket({
    orderId: showTracking ? shipment?.id : null,
    enabled: showTracking,
  });

  useEffect(() => {
    if (!shipmentId) {
      setIsLoading(false);
      return;
    }

    const fetchShipment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${shipmentId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al cargar el envío');
        }

        const responseData = await response.json();
        setShipment(responseData);
      } catch (err) {
        console.error('Error fetching shipment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipment();
  }, [shipmentId]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handlePublish = async () => {
    if (!shipmentId) return;

    Alert.alert(
      'Publicar envío',
      '¿Quieres publicar este envío para que esté disponible para los repartidores?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Publicar',
          onPress: async () => {
            setIsPublishing(true);
            try {
              const response = await fetch(`${API_BASE_URL}/orders/${shipmentId}/publish`, {
                method: 'POST',
                credentials: 'include',
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al publicar el envío');
              }

              const publishResponse = await response.json();
              setShipment(publishResponse);

              Alert.alert('Éxito', 'El envío ha sido publicado y está disponible para los repartidores.');
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo publicar el envío');
            } finally {
              setIsPublishing(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = async () => {
    if (!shipmentId || !shipment) return;

    Alert.alert(
      'Cancelar envío',
      '¿Estás seguro de que deseas cancelar este envío? Se reembolsará el cargo de servicio.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              const response = await fetch(`${API_BASE_URL}/orders/${shipmentId}`, {
                method: 'DELETE',
                credentials: 'include',
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'No se pudo cancelar el envío');
              }

              Alert.alert('Éxito', 'El envío ha sido cancelado y se ha reembolsado el cargo.');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo cancelar el envío');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator color={appColors.primary} size="large" />
          <Text className="text-sm text-text/60 mt-3">Cargando detalles...</Text>
        </SafeAreaView>
        <BottomNavCustomer activeScreen="ClientShipmentDetail" navigation={navigation} />
      </View>
    );
  }

  if (!shipment) {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1 justify-center items-center">
          <AlertCircle size={48} color={appColors.error} />
          <Text className="text-lg font-semibold text-text mt-4">Envío no encontrado</Text>
          <Text className="text-sm text-text/60 mt-2">El envío no existe o no tienes acceso</Text>
        </SafeAreaView>
        <BottomNavCustomer activeScreen="ClientShipmentDetail" navigation={navigation} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <OrderDetailContent
            order={shipment}
            showMap={true}
            driverLocation={showTracking ? driverLocation : null}
          />
        </ScrollView>

        <View className="px-5 pb-4">
          {shipment.status === 'creado' && (
            <>
              <Pressable
                onPress={handlePublish}
                disabled={isPublishing}
                className={`rounded-xl py-3.5 items-center flex-row justify-center mb-3 ${
                  isPublishing ? 'bg-border' : 'bg-success'
                }`}
              >
                {isPublishing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Send size={18} color="white" className="mr-2" />
                    <Text className="text-white font-semibold">Publicar envío</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                onPress={handleCancel}
                disabled={isCancelling}
                className={`rounded-xl py-3.5 items-center flex-row justify-center ${
                  isCancelling ? 'bg-border' : 'bg-red-600'
                }`}
              >
                {isCancelling ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Cancelar envío</Text>
                )}
              </Pressable>
            </>
          )}
          {shipment.status === 'disponible' && (
            <Pressable
              onPress={handleCancel}
              disabled={isCancelling}
              className={`rounded-xl py-3.5 items-center flex-row justify-center ${
                isCancelling ? 'bg-border' : 'bg-red-600'
              }`}
            >
              {isCancelling ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Cancelar envío</Text>
              )}
            </Pressable>
          )}
          {['aceptado', 'en_recorrido', 'recogido', 'en_entrega', 'incidencia'].includes(shipment.status) && (
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Reportar incidencia',
                  '¿Deseas reportar un problema con este envío?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Reportar',
                      onPress: () => navigation.navigate('CreateIncident', { orderId: shipment.id }),
                    },
                  ],
                );
              }}
              className="bg-red-600 rounded-xl py-3.5 items-center flex-row justify-center"
            >
              <Flag size={18} color="white" className="mr-2" />
              <Text className="text-white font-semibold">Reportar incidencia</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
      <BottomNavCustomer activeScreen="ClientShipmentDetail" navigation={navigation} />
    </View>
  );
}