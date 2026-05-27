import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { AlertCircle, CheckCircle } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import type { Incident } from '@/types/incident';
import { formatDateTime } from '@/utils/date-formatters';

export type IncidentDetailData = Incident;

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  abierta: { label: 'Abierta', color: appColors.error, bgColor: '#FEE2E2' },
  en_proceso: { label: 'En proceso', color: '#D97706', bgColor: '#FEF3C7' },
  resuelta: { label: 'Resuelta', color: appColors.success, bgColor: '#DCFCE7' },
};

interface SharedIncidentDetailProps {
  incident: IncidentDetailData;
  showOrderButton?: boolean;
  onOrderPress?: () => void;
  onResolve?: () => void;
}

// Vista compartida de detalle de incidencia para cliente y repartidor
export function SharedIncidentDetail({
  incident,
  showOrderButton = false,
  onOrderPress,
  onResolve,
}: SharedIncidentDetailProps) {
  const statusConfig = STATUS_CONFIG[incident.status] ?? { label: incident.status, color: '#6B7280', bgColor: '#F3F4F6' };
  const images = incident.images ?? [];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  console.log('[SharedIncidentDetail] Recibido incidente:', JSON.stringify(incident).substring(0, 300));
  console.log('[SharedIncidentDetail] Valor de incident.images:', incident.images);
  console.log('[SharedIncidentDetail] Array de images después ?? []:', images);

  return (
    <>
      <View className="bg-white rounded-xl p-4 border border-border mb-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xs font-medium text-primary uppercase tracking-wider">
              {incident.code}
            </Text>
            <Text className="text-lg font-bold text-text mt-1">{incident.title}</Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: statusConfig.bgColor }}
          >
            <Text className="text-xs font-semibold" style={{ color: statusConfig.color }}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {onOrderPress ? (
            <Pressable onPress={onOrderPress}>
              <Text className="text-sm text-primary font-semibold underline">
                Orden #{incident.orderPublicId ?? incident.orderId}
              </Text>
            </Pressable>
          ) : (
            <Text className="text-sm text-text/60 mb-1">Orden #{incident.orderPublicId ?? incident.orderId}</Text>
          )}
        <Text className="text-sm text-text/60">
          Reportada por {incident.creatorName ?? 'Desconocido'} • {formatDateTime(incident.createdAt)}
        </Text>
      </View>

      <View className="bg-white rounded-xl p-4 border border-border mb-4">
        <Text className="text-sm font-semibold text-text mb-2">Descripción</Text>
        <Text className="text-sm text-text/80 leading-5">{incident.description}</Text>
      </View>

      {images.length > 0 && (
        <View className="bg-white rounded-xl p-4 border border-border mb-4">
          <Text className="text-sm font-semibold text-text mb-3">Evidencia ({images.length})</Text>
          {images.map((img) => (
            <Pressable key={img.id} onPress={() => setSelectedImage(img.imageUrl)}>
              <Image
                source={{ uri: img.imageUrl }}
                style={{ width: 112, height: 112, borderRadius: 12, marginRight: 12 }}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </View>
      )}

      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View className="flex-1 bg-black/90 justify-center items-center">
          <Pressable className="absolute top-12 right-4 z-10" onPress={() => setSelectedImage(null)}>
            <Text className="text-white text-xl font-bold">✕</Text>
          </Pressable>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={{ width: '90%', height: '70%' }} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {incident.resolutionNote && (
        <View className="bg-green-50 rounded-xl p-4 border border-green-200 mb-4">
          <View className="flex-row items-center mb-2">
            <CheckCircle size={18} color="#16A34A" />
            <Text className="text-sm font-semibold text-green-700 ml-2">Resolución</Text>
          </View>
          <Text className="text-sm text-green-800 leading-5">{incident.resolutionNote}</Text>
          {incident.resolvedAt && (
            <Text className="text-xs text-green-600 mt-2">Resuelta el {formatDateTime(incident.resolvedAt)}</Text>
          )}
        </View>
      )}

      {showOrderButton && onOrderPress && (
        <Pressable
          onPress={onOrderPress}
          className="bg-primary rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold">Ver orden relacionada</Text>
        </Pressable>
      )}

      {incident.status !== 'resuelta' && onResolve && (
        <Pressable
          onPress={onResolve}
          className="bg-green-600 rounded-xl py-3 items-center mt-3"
        >
          <Text className="text-white font-semibold">Cerrar incidencia</Text>
        </Pressable>
      )}
    </>
  );
}

interface IncidentDetailLoaderProps {
  isLoading: boolean;
  incident: IncidentDetailData | null;
  children: (incident: IncidentDetailData) => React.ReactNode;
}

// Componente para cargar y mostrar incidencias con estados de carga y error
export function IncidentDetailLoader({ isLoading, incident, children }: IncidentDetailLoaderProps) {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color={appColors.primary} size="large" />
        <Text className="text-sm text-text/60 mt-3">Cargando...</Text>
      </View>
    );
  }

  if (!incident) {
    return (
      <View className="flex-1 justify-center items-center">
        <AlertCircle size={48} color={appColors.error} />
        <Text className="text-lg font-semibold text-text mt-4">Incidencia no encontrada</Text>
      </View>
    );
  }

  return <>{children(incident)}</>;
}