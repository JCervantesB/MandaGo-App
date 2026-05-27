/**
 * Pantalla de detalles de un cliente para el admin.
 * Muestra información del usuario, perfil de cliente y permite activar/desactivar.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getClientDetails, updateUserStatus, type ClientDetails } from '@/api/admin-api';
import type { RootStackParamList } from '@/navigation/types';
import { StatusRibbon } from '@/components/admin-components/common/StatusRibbon';
import { InfoSection } from '@/components/admin-components/common/InfoSection';
import { formatDateTime } from '@/utils/date-formatters';
import { appColors } from '@/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientDetailAdmin'>;

export function ClientDetailAdminScreen({ route }: Props) {
  const { userId } = route.params;
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifiedCorrect, setVerifiedCorrect] = useState(false);

  useEffect(() => {
    loadClient();
  }, [userId]);

  const loadClient = async () => {
    const data = await getClientDetails(userId);
    setClient(data);
    setLoading(false);
  };

  const handleToggleStatus = async () => {
    if (!client) return;

    if (!verifiedCorrect) {
      Alert.alert(
        'Verificación requerida',
        'Debes marcar que todo está correcto para activar el cliente.',
      );
      return;
    }

    Alert.alert(
      '¿Confirmar activación?',
      'El cliente será activado y podrá acceder a la aplicación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const success = await updateUserStatus(userId, 'activo');
            if (success) {
              setClient({ ...client, status: 'activo' });
              setVerifiedCorrect(false);
              Alert.alert('Éxito', 'Cliente activado correctamente');
            } else {
              Alert.alert('Error', 'No se pudo activar el cliente');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text className="text-sm text-text-muted mt-3">Cargando información...</Text>
      </View>
    );
  }

  if (!client) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <Text className="text-base text-text/60 text-center">
          No se encontró la información del cliente.
        </Text>
      </View>
    );
  }

  const isActive = client.status === 'activo';

  const basicInfoRows = [
    { label: 'Nombre:', value: client.name },
    { label: 'Email:', value: client.email },
    { label: 'Teléfono:', value: client.phone || 'No registrado' },
    { label: 'Rol:', value: client.role === 'cliente' ? 'Cliente' : client.role },
    { label: 'Fecha de registro:', value: formatDateTime(client.createdAt) },
  ];

  const customerProfileRows = client.customerProfile
    ? [
        { label: 'Nombre comercial:', value: client.customerProfile.businessName || '-' },
        { label: 'RFC:', value: client.customerProfile.rfc || '-' },
        {
          label: 'Dirección:',
          value:
            [
              client.customerProfile.street,
              client.customerProfile.streetNumber,
              client.customerProfile.colony,
            ]
              .filter(Boolean)
              .join(', ') || '-',
        },
        { label: 'Ciudad:', value: client.customerProfile.city || '-' },
        { label: 'Estado:', value: client.customerProfile.state || '-' },
        { label: 'Código postal:', value: client.customerProfile.postalCode || '-' },
      ]
    : [];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-4">
        <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
          MandaGo
        </Text>
        <Text className="text-3xl font-extrabold text-text mt-1">
          Detalle del cliente
        </Text>
        <Text className="text-sm text-text-muted mt-2 leading-5">
          Revisa la información del usuario y valida los datos del negocio antes de activarlo.
        </Text>
      </View>

      <View className="bg-surface border border-border rounded-2xl p-4 mb-4">
        <StatusRibbon status={client.status} />        
      </View>

      <View className="gap-4">
        <InfoSection
          title="Información del usuario"
          rows={basicInfoRows}
        />

        <InfoSection
          title="Datos del negocio"
          rows={customerProfileRows}
          emptyMessage="Sin datos de perfil"
        />

        <View className="bg-surface border border-border rounded-2xl p-4">
          <Text className="text-base font-extrabold text-text mb-1">
            Acciones
          </Text>
          <Text className="text-sm text-text-muted mb-4 leading-5">
            Confirma que la información esté correcta antes de activar esta cuenta.
          </Text>

          <View className="flex-row items-center mb-4 gap-3">
            <Pressable
              onPress={() => setVerifiedCorrect(!verifiedCorrect)}
              className={`w-6 h-6 rounded border-2 items-center justify-center ${
                verifiedCorrect
                  ? 'bg-primary border-primary'
                  : 'border-border bg-white'
              }`}
            >
              {verifiedCorrect && (
                <Text className="text-white text-sm font-bold">✓</Text>
              )}
            </Pressable>

            <Text className="flex-1 text-sm text-text leading-5">
              Verifiqué que toda la información está correcta
            </Text>
          </View>

          <Pressable
            onPress={handleToggleStatus}
            disabled={!verifiedCorrect || isActive}
            className={`py-4 rounded-xl items-center ${
              !verifiedCorrect || isActive ? 'opacity-50' : ''
            } ${isActive ? 'bg-success' : 'bg-primary active:bg-primary-pressed'}`}
          >
            <Text className="text-white text-base font-semibold">
              {isActive ? 'Cliente activo' : 'Activar cliente'}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}