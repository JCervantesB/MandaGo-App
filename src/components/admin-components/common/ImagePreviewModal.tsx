/**
 * Componente ImagePreviewModal
 * Modal para previsualizar imágenes a pantalla completa
 */
import { Modal, Image, Pressable, View, Text } from 'react-native';

interface ImagePreviewModalProps {
  visible: boolean;
  url: string;
  title: string;
  onClose: () => void;
}

// Modal para previsualizar imágenes a pantalla completa
export function ImagePreviewModal({ visible, url, title, onClose }: ImagePreviewModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/90 justify-center items-center" onPress={onClose}>
        <View className="w-[90%] max-h-[80%] bg-white rounded-xl p-4">
          <Text className="text-lg font-bold text-text text-center mb-4">{title}</Text>
          <Image
            source={{ uri: url }}
            className="w-full h-96 bg-border rounded-lg"
            resizeMode="contain"
          />
          <Pressable className="mt-4 py-3 bg-primary rounded-lg items-center" onPress={onClose}>
            <Text className="text-white text-base font-semibold">Cerrar</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}