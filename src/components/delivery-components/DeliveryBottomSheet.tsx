import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, Modal, TextInput, Alert, Image } from 'react-native';
import { MapPin, Navigation, Package, User, CheckCircle, Camera, X, Image as ImageIcon, MessageCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { appColors } from '@/theme/theme';
import type { DeliveryOrder } from '@/types/delivery-order';
import { API_BASE_URL } from '@/config/api';

interface DeliveryBottomSheetProps {
  order: DeliveryOrder | null;
  onAction: (action: 'claim' | 'accept' | 'start_route' | 'mark_picked' | 'start_delivery' | 'confirm_delivery' | 'abandon') => void;
  onClose?: () => void;
  onDeliveryConfirmed?: () => void;
  onChatPress?: () => void;
  isLoading?: boolean;
}

interface BottomSheetStateConfig {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  showRecipientInfo: boolean;
  showPackageInfo: boolean;
  showBusinessInfo: boolean;
  actionLabel: string;
  actionColor: string;
}

const STATE_CONFIG: Record<string, BottomSheetStateConfig> = {
  disponible: {
    title: 'Pedido disponible',
    icon: <MapPin size={24} color={appColors.success} />,
    iconColor: appColors.success,
    showRecipientInfo: false,
    showPackageInfo: false,
    showBusinessInfo: false,
    actionLabel: 'Aceptar pedido',
    actionColor: appColors.success,
  },
  asignado: {
    title: 'Pedido aceptado',
    icon: <CheckCircle size={24} color={appColors.primary} />,
    iconColor: appColors.primary,
    showRecipientInfo: false,
    showPackageInfo: true,
    showBusinessInfo: true,
    actionLabel: 'Continuar',
    actionColor: appColors.primary,
  },
  aceptado: {
    title: 'Listo para recoger',
    icon: <Package size={24} color={appColors.primary} />,
    iconColor: appColors.primary,
    showRecipientInfo: false,
    showPackageInfo: true,
    showBusinessInfo: true,
    actionLabel: 'Iniciar recorrido',
    actionColor: appColors.primary,
  },
  en_recorrido: {
    title: 'En camino a recoger',
    icon: <Navigation size={24} color={appColors.primary} />,
    iconColor: appColors.primary,
    showRecipientInfo: false,
    showPackageInfo: true,
    showBusinessInfo: true,
    actionLabel: 'Marcar como recogido',
    actionColor: appColors.success,
  },
  recogido: {
    title: 'Paquete recogido',
    icon: <Package size={24} color={appColors.success} />,
    iconColor: appColors.success,
    showRecipientInfo: true,
    showPackageInfo: true,
    showBusinessInfo: false,
    actionLabel: 'Iniciar entrega',
    actionColor: appColors.primary,
  },
  en_entrega: {
    title: 'En camino a entregar',
    icon: <Navigation size={24} color={appColors.primary} />,
    iconColor: appColors.primary,
    showRecipientInfo: true,
    showPackageInfo: false,
    showBusinessInfo: false,
    actionLabel: 'Confirmar entrega',
    actionColor: appColors.success,
  },
  entregado: {
    title: '¡Entregado!',
    icon: <CheckCircle size={24} color={appColors.success} />,
    iconColor: appColors.success,
    showRecipientInfo: true,
    showPackageInfo: false,
    showBusinessInfo: false,
    actionLabel: 'Finalizar',
    actionColor: appColors.primary,
  },
};

// Hoja inferior para acciones del repartidor (aceptar, iniciar ruta, entregar)
export function DeliveryBottomSheet({ order, onAction, onClose, onDeliveryConfirmed, onChatPress, isLoading = false }: DeliveryBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deliveryImageBase64, setDeliveryImageBase64] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const config = STATE_CONFIG[order.status] || STATE_CONFIG.disponible;
  
  // Manejar acciones del repartidor
  const handleAction = () => {
    switch (order.status) {
      case 'disponible':
        Alert.alert(
          'Aceptar pedido',
          'Al aceptar este pedido se cobrarán 5 créditos de tu cartera. Si decides abandonarlo después, los créditos NO te serán reembolsados.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Aceptar', onPress: () => onAction('claim') },
          ],
        );
        break;
      case 'asignado': onAction('accept'); break;
      case 'aceptado': onAction('start_route'); break;
      case 'en_recorrido': onAction('mark_picked'); break;
      case 'recogido': onAction('start_delivery'); break;
      case 'en_entrega':
        setReceiverName(order.destName || '');
        setShowConfirmModal(true);
        break;
      case 'entregado': onClose?.(); break;
    }
  };

  // Manejar confirmación de entrega
   const handleConfirmDelivery = async () => {
    if (!deliveryImageBase64) {
      Alert.alert('Error', 'Por favor toma o sube una foto de la entrega');
      return;
    }
    if (!receiverName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre de quien recibe');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/${order.id}/delivery/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageBase64: deliveryImageBase64, receiverName: receiverName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'No se pudo confirmar la entrega');
      }

      Alert.alert('¡Éxito!', 'Pedido entregado correctamente', [{
        text: 'OK',
        onPress: () => {
          setShowConfirmModal(false);
          setDeliveryImageBase64(null);
          setReceiverName('');
          onDeliveryConfirmed?.();
        },
      }]);
    } catch {
      Alert.alert('Error', 'No se pudo completar la entrega');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Manejar toma de foto de entrega
   const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso denegado', 'Se necesita permiso de cámara'); return; }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7, base64: true });
    if (!result.canceled && result.assets[0].base64) {
      setDeliveryImageBase64(`data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso denegado', 'Se necesita permiso de galería'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7, base64: true });
    if (!result.canceled && result.assets[0].base64) {
      setDeliveryImageBase64(`data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`);
    }
  };

  return (
    <>
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl" style={{ minHeight: 140 }}>
        <Pressable onPress={() => setIsExpanded(!isExpanded)} className="items-center py-3">
          <View className="w-10 h-1 bg-gray-300 rounded mb-2" />
          <Text className="text-xs text-gray-500">{isExpanded ? '▼ Contraer' : '▲ Expandir'}</Text>
        </Pressable>

        <View className="flex-row items-center px-5 pb-3 border-b border-gray-100">
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: config.iconColor + '20' }}>
            {config.icon}
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-lg font-bold text-text">{config.title}</Text>
            <Text className="text-sm text-gray-500">#{order.publicId}</Text>
          </View>
          {order.priority === 'express' && (
            <View className="bg-yellow-100 px-2 py-1 rounded mr-2">
              <Text className="text-xs font-bold text-yellow-700">EXPRESS</Text>
            </View>
          )}
          {(order.status === 'asignado' || order.status === 'aceptado' || order.status === 'en_recorrido' || order.status === 'recogido' || order.status === 'en_entrega') && (
            <Pressable
              onPress={onChatPress}
              className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
            >
              <MessageCircle size={20} color={appColors.primary} />
            </Pressable>
          )}
        </View>

        {isExpanded && (
          <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
            <View className="py-3 border-b border-gray-100">
              <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Punto de recogida</Text>
              <View className="flex-row items-start">
                <MapPin size={16} color={appColors.success} />
                <Text className="text-sm text-text ml-2 flex-1">{order.originAddress}</Text>
              </View>
            </View>

            <View className="py-3 border-b border-gray-100">
              <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Punto de entrega</Text>
              <View className="flex-row items-start">
                <Navigation size={16} color={appColors.mapDestination} />
                <Text className="text-sm text-text ml-2 flex-1">{order.destAddress}</Text>
              </View>
            </View>

            {config.showPackageInfo && (
              <View className="py-3 border-b border-gray-100">
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Paquete</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-text">{order.packageDescription}</Text>
                  <View className="bg-gray-100 px-2 py-1 rounded">
                    <Text className="text-xs font-semibold text-text capitalize">{order.packageSize}</Text>
                  </View>
                </View>
              </View>
            )}

            {config.showRecipientInfo && (
              <View className="py-3 border-b border-gray-100">
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Datos del destinatario</Text>
                <View className="flex-row items-center bg-gray-50 p-3 rounded-xl">
                  <User size={18} color={appColors.primary} />
                  <View className="ml-3">
                    <Text className="text-base font-semibold text-text">{order.destName}</Text>
                    <Text className="text-sm text-gray-500">{order.destPhone}</Text>
                  </View>
                </View>
              </View>
            )}

            {order.status === 'entregado' && (
              <View className="py-4 my-4 bg-green-50 rounded-xl items-center">
                <Text className="text-xs font-semibold text-green-700">Tu ganancia</Text>
                <Text className="text-2xl font-bold text-green-800 mt-1">{order.driverEarning} créditos</Text>
              </View>
            )}
          </ScrollView>
        )}

        <View className="px-5 pb-8 pt-3">
          <Pressable
            onPress={handleAction}
            disabled={isLoading}
            className="h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: config.actionColor }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">{config.actionLabel}</Text>
            )}
          </Pressable>

          {(order.status === 'asignado' || order.status === 'aceptado' || order.status === 'en_recorrido') && (
            <Pressable
              onPress={() => onAction('abandon')}
              className="h-12 rounded-2xl items-center justify-center mt-3 border-2 border-red-300"
              style={{ borderColor: '#FCA5A5' }}
            >
              <Text className="text-base font-bold text-red-500">Abandonar pedido</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Modal visible={showConfirmModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5" style={{ maxHeight: '85%' }}>
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-text">Confirmar entrega</Text>
              <Pressable onPress={() => setShowConfirmModal(false)}><X size={24} color={appColors.text} /></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-sm font-semibold text-text mb-2">Evidencia de entrega *</Text>
              {deliveryImageBase64 ? (
                <View className="relative mb-4">
                  <Image source={{ uri: deliveryImageBase64 }} className="w-full h-48 rounded-xl" />
                  <Pressable className="absolute top-2 right-2 bg-black/60 rounded-full p-1" onPress={() => setDeliveryImageBase64(null)}>
                    <X size={16} color="white" />
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row gap-3 mb-4">
                  <Pressable className="flex-1 bg-gray-100 rounded-xl p-5 items-center border-2 border-dashed border-gray-300" onPress={takePhoto}>
                    <Camera size={24} color={appColors.primary} />
                    <Text className="text-sm font-semibold text-text mt-2">Cámara</Text>
                  </Pressable>
                  <Pressable className="flex-1 bg-gray-100 rounded-xl p-5 items-center border-2 border-dashed border-gray-300" onPress={pickImage}>
                    <ImageIcon size={24} color={appColors.primary} />
                    <Text className="text-sm font-semibold text-text mt-2">Galería</Text>
                  </Pressable>
                </View>
              )}

              <Text className="text-sm font-semibold text-text mt-5 mb-2">Nombre de quien recibe *</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 text-base text-text border border-gray-200 mb-5"
                value={receiverName}
                onChangeText={setReceiverName}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor={appColors.textMuted}
              />
            </ScrollView>

            <Pressable
              className="h-14 rounded-2xl items-center justify-center mb-5"
              style={{ backgroundColor: appColors.success, opacity: isSubmitting ? 0.6 : 1 }}
              onPress={handleConfirmDelivery}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-base font-bold text-white">Confirmar entrega</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}