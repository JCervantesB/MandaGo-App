import { Alert, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface Base64DocumentInput {
  base64: string;
  mimeType: string;
  fileName?: string;
}

export interface DocumentPickerProps {
  document: Base64DocumentInput | null;
  onSelect: (doc: Base64DocumentInput) => void;
  error?: string;
  placeholder: string;
}

// Permite seleccionar una imagen de la biblioteca como documento base64
export function DocumentPicker({
  document,
  onSelect,
  error,
  placeholder,
}: DocumentPickerProps) {
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permiso requerido',
        'Se necesita permiso para acceder a tus fotos.',
      );
      return;
    }

    // Abrir la biblioteca de imágenes
       const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'No se pudo procesar la imagen');
        return;
      }

      const mimeType = asset.mimeType || 'image/jpeg';
      const fileName = asset.fileName || `document_${Date.now()}.jpg`;

      onSelect({
        base64: asset.base64,
        mimeType,
        fileName,
      });
    }
  };

  return (
    <Pressable
      onPress={pickImage}
      className={`border rounded-lg p-4 items-center justify-center min-h-15 ${error ? 'border-error' : 'border-border'} ${document ? 'border-success bg-success/10 border-solid' : 'border-dashed bg-white'}`}
    >
      {document ? (
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-medium text-success">Imagen adjuntada</Text>
          <Text className="text-success">✓</Text>
        </View>
      ) : (
        <Text className="text-sm text-text/70">{placeholder}</Text>
      )}
    </Pressable>
  );
}