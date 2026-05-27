import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getClientDetails, updateUserStatus, rejectUser, type ClientDetails } from '@/api/admin-api';
import type { RootStackParamList } from '@/navigation/types';
import { StatusRibbon } from '@/components/admin-components/common/StatusRibbon';
import { InfoSection } from '@/components/admin-components/common/InfoSection';
import { DocumentsSection } from '@/components/admin-components/common/DocumentsSection';
import { ImagePreviewModal } from '@/components/admin-components/common/ImagePreviewModal';
import { RejectModal } from '@/components/admin-components/common/RejectModal';
import { ActionButtons } from '@/components/admin-components/common/ActionButtons';
import { formatDateTime } from '@/utils/date-formatters';
import { appColors } from '@/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverDetailAdmin'>;

const vehicleTypeLabels: Record<string, string> = {
  bicicleta: 'Bicicleta',
  motocicleta: 'Motocicleta',
  coche: 'Coche',
  camioneta: 'Camioneta',
};

export function DriverDetailAdminScreen({ route }: Props) {
  const { userId } = route.params;
  const [driver, setDriver] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({ visible: false, url: '', title: '' });
  const [verifiedCorrect, setVerifiedCorrect] = useState(false);
  const [rejectModal, setRejectModal] = useState({ visible: false, reason: '' });

  useEffect(() => {
    loadDriver();
  }, [userId]);

  const loadDriver = async () => {
    const data = await getClientDetails(userId);
    setDriver(data);
    setLoading(false);
  };

  const handleActivate = async () => {
    if (!driver || !verifiedCorrect) return;

    const success = await updateUserStatus(userId, 'activo');
    if (success) {
      setDriver({ ...driver, status: 'activo' });
      setVerifiedCorrect(false);
    }
  };

  const handleReject = async () => {
    if (!driver || !rejectModal.reason.trim()) return;

    const success = await rejectUser(userId, rejectModal.reason.trim());
    if (success) {
      setDriver({ ...driver, status: 'deshabilitado' });
      setRejectModal({ visible: false, reason: '' });
    }
  };

  const openDocument = (url: string | null, title: string) => {
    if (url) {
      setPreviewModal({ visible: true, url, title });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text className="text-sm text-text-muted mt-3">Cargando información...</Text>
      </View>
    );
  }

  if (!driver) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <Text className="text-base text-text/60 text-center">
          No se encontró la información del repartidor.
        </Text>
      </View>
    );
  }

  const isActive = driver.status === 'activo';

  const basicInfoRows = [
    { label: 'Nombre:', value: driver.name },
    { label: 'Email:', value: driver.email },
    { label: 'Teléfono:', value: driver.phone || 'No registrado' },
    { label: 'Rol:', value: 'Repartidor' },
    { label: 'Fecha de registro:', value: formatDateTime(driver.createdAt) },
  ];

  const profileRows = driver.driverProfile
    ? [
        {
          label: 'Tipo de vehículo:',
          value:
            vehicleTypeLabels[driver.driverProfile.vehicleType || ''] ||
            driver.driverProfile.vehicleType ||
            '-',
        },
        {
          label: 'Dirección:',
          value:
            [
              driver.driverProfile.street,
              driver.driverProfile.streetNumber,
              driver.driverProfile.colony,
            ]
              .filter(Boolean)
              .join(', ') || '-',
        },
        { label: 'Ciudad:', value: driver.driverProfile.city || '-' },
        { label: 'Estado:', value: driver.driverProfile.state || '-' },
        { label: 'Código postal:', value: driver.driverProfile.postalCode || '-' },
      ]
    : [];

  const documents = [
    { label: 'INE:', url: driver.driverProfile?.ineUrl || null },
    { label: 'Licencia de conducir:', url: driver.driverProfile?.driverLicenseUrl || null },
    { label: 'Foto del vehículo:', url: driver.driverProfile?.vehiclePhotoUrl || null },
  ];

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
          Detalle del repartidor
        </Text>
        <Text className="text-sm text-text-muted mt-2 leading-5">
          Revisa la información del perfil, valida los documentos y toma una decisión.
        </Text>
      </View>

      <View className="bg-surface border border-border rounded-2xl p-4 mb-4">
        <StatusRibbon status={driver.status} />
      </View>

      <View className="gap-4">
        <InfoSection
          title="Información del repartidor"
          rows={basicInfoRows}
        />

        <InfoSection
          title="Datos del repartidor"
          rows={profileRows}
          emptyMessage="Sin datos de perfil"
        />

        <DocumentsSection
          documents={documents}
          onDocumentPress={openDocument}
        />

        <View className="bg-surface border border-border rounded-2xl p-4">
          <Text className="text-base font-extrabold text-text mb-1">
            Acciones
          </Text>
          <Text className="text-sm text-text-muted mb-4 leading-5">
            Confirma que los datos sean correctos antes de aprobar o rechazar este perfil.
          </Text>

          <ActionButtons
            verifiedCorrect={verifiedCorrect}
            onVerifiedChange={setVerifiedCorrect}
            isActive={isActive}
            onActivate={handleActivate}
            onReject={() => setRejectModal({ visible: true, reason: '' })}
          />
        </View>
      </View>

      <ImagePreviewModal
        visible={previewModal.visible}
        url={previewModal.url}
        title={previewModal.title}
        onClose={() => setPreviewModal({ visible: false, url: '', title: '' })}
      />

      <RejectModal
        visible={rejectModal.visible}
        reason={rejectModal.reason}
        onReasonChange={(text) => setRejectModal({ ...rejectModal, reason: text })}
        onConfirm={handleReject}
        onCancel={() => setRejectModal({ visible: false, reason: '' })}
      />
    </ScrollView>
  );
}