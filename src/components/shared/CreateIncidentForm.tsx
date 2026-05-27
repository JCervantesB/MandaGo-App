import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { incidentCatalog } from '@/data/incident-catalog';
import { API_BASE_URL } from '@/config/api';
import { appColors } from '@/theme/theme';
import type { AdminStackParamList, ClientStackParamList } from '@/navigation/types';

interface CreateIncidentFormProps {
  orderId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  navigation?: NativeStackNavigationProp<AdminStackParamList & ClientStackParamList>;
}

interface ImageItem {
  uri: string;
  base64: string;
  mimeType: string;
}

// Formulario para crear una incidencia con fotos y descripción
export function CreateIncidentForm({ orderId, onSuccess, onCancel, navigation }: CreateIncidentFormProps) {
  const [selectedCode, setSelectedCode] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  // Manejar selección de imágenes de la galería
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        base64: asset.base64 ?? '',
        mimeType: asset.mimeType ?? 'image/jpeg',
      }));
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  // Manejar captura de fotos con la cámara
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado', 'Se necesita permiso para usar la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setImages((prev) => [
        ...prev,
        { uri: asset.uri, base64: asset.base64 ?? '', mimeType: asset.mimeType ?? 'image/jpeg' },
      ].slice(0, 5));
    }
  };

  // Manejar eliminación de imágenes
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedCode) {
      Alert.alert('Error', 'Por favor selecciona un tipo de incidencia.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor proporciona una descripción.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        orderId,
        code: selectedCode,
        description: description.trim(),
        images: images.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
      };

      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear incidencia');
      }

      Alert.alert('Éxito', 'Incidencia reportada correctamente.', [
        { text: 'OK', onPress: onSuccess ?? (() => navigation?.goBack()) },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo crear la incidencia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCatalogItem = incidentCatalog.find((i) => i.code === selectedCode);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
        <Pressable onPress={onCancel ?? (() => navigation?.goBack())} className="mr-3">
          <X size={24} color={appColors.text} />
        </Pressable>
        <Text className="text-lg font-bold text-text">Reportar incidencia</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text mb-2">Tipo de incidencia *</Text>
          <Pressable
            onPress={() => setShowCatalogModal(true)}
            className="bg-white border border-border rounded-xl px-4 py-3"
          >
            <Text className={selectedCode ? 'text-sm text-text' : 'text-sm text-text/50'}>
              {selectedCatalogItem ? `${selectedCatalogItem.code} - ${selectedCatalogItem.title}` : 'Seleccionar tipo...'}
            </Text>
          </Pressable>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-text mb-2">Descripción *</Text>
          <TextInput
            className="bg-white border border-border rounded-xl px-4 py-3 text-sm text-text"
            placeholder="Describe el problema con más detalle..."
            placeholderTextColor={appColors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            style={{ minHeight: 100 }}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-text mb-2">Evidencia (opcional)</Text>
          <Text className="text-xs text-text/60 mb-2">Hasta 5 imágenes</Text>
          <View className="flex-row flex-wrap gap-2">
            {images.map((img, index) => (
              <View key={index} className="relative">
                <Image source={{ uri: img.uri }} className="w-20 h-20 rounded-lg" />
                <Pressable
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                >
                  <X size={14} color="white" />
                </Pressable>
              </View>
            ))}
            {images.length < 5 && (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={takePhoto}
                  className="w-20 h-20 bg-white border border-border rounded-lg items-center justify-center"
                >
                  <Camera size={24} color={appColors.textMuted} />
                  <Text className="text-xs text-text/50 mt-1">Cámara</Text>
                </Pressable>
                <Pressable
                  onPress={pickImage}
                  className="w-20 h-20 bg-white border border-border rounded-lg items-center justify-center"
                >
                  <Text className="text-2xl text-text/30">+</Text>
                  <Text className="text-xs text-text/50 mt-1">Galería</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !selectedCode || !description.trim()}
          className={`rounded-xl py-3 items-center ${
            isSubmitting || !selectedCode || !description.trim()
              ? 'bg-text/30'
              : 'bg-primary'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Reportar incidencia</Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal visible={showCatalogModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[70%]">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
              <Text className="text-lg font-bold text-text">Seleccionar tipo</Text>
              <Pressable onPress={() => setShowCatalogModal(false)}>
                <X size={24} color={appColors.text} />
              </Pressable>
            </View>
            <ScrollView className="p-4">
              {incidentCatalog.map((item) => (
                <Pressable
                  key={item.code}
                  onPress={() => {
                    setSelectedCode(item.code);
                    setShowCatalogModal(false);
                  }}
                  className={`p-4 rounded-xl mb-2 ${
                    selectedCode === item.code ? 'bg-primary/10 border border-primary' : 'bg-background'
                  }`}
                >
                  <Text className="text-xs font-medium text-primary">{item.code}</Text>
                  <Text className="text-sm font-semibold text-text mt-1">{item.title}</Text>
                  <Text className="text-xs text-text/60 mt-0.5">{item.description}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}