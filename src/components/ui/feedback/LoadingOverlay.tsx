import { ActivityIndicator, Modal, Text, View } from 'react-native';
import { appColors } from '@/theme/theme';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

// Overlay semitransparente con indicador de carga
export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 items-center min-w-40">
          <ActivityIndicator size="large" color={appColors.primary} />
          {message && <Text className="mt-3 text-sm font-medium text-text text-center">{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}