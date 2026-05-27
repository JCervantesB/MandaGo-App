/**
 * Componente RejectModal
 * Modal para ingresar el motivo del rechazo de un usuario
 */
import { Modal, TextInput, Pressable, View, Text } from 'react-native';
import { appColors } from '@/theme/theme';

interface RejectModalProps {
  visible: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

// Modal para ingresar el motivo del rechazo de un usuario
export function RejectModal({ visible, reason, onReasonChange, onConfirm, onCancel }: RejectModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onCancel}>
        <Pressable className="w-[90%] bg-white rounded-xl p-5" onPress={(e) => e.stopPropagation()}>
          <Text className="text-lg font-bold text-text text-center mb-2">Motivo del rechazo</Text>
          <Text className="text-sm text-text/70 mb-4 leading-5">
            Ingresa el motivo por el cual se rechaza la solicitud.
            El usuario será notificado por email.
          </Text>
          <TextInput
            className="border border-border rounded-lg p-3 text-sm text-text min-h-24 bg-white"
            placeholder="Ej: Documentos incompletos, datos incorrectos, etc."
            placeholderTextColor={appColors.textSoft}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={reason}
            onChangeText={onReasonChange}
          />
          <View className="flex-row gap-3 mt-4">
            <Pressable className="flex-1 py-3 rounded-lg border border-border items-center" onPress={onCancel}>
              <Text className="text-text text-base font-semibold">Cancelar</Text>
            </Pressable>
            <Pressable className="flex-1 py-3 rounded-lg bg-red-600 items-center" onPress={onConfirm}>
              <Text className="text-white text-base font-semibold">Rechazar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}