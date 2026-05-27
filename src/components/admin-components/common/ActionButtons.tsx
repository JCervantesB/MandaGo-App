/**
 * Componente ActionButtons
 * Botones para activar o rechazar usuario con checkbox de verificación
 */
import { View, Text, Pressable } from 'react-native';

interface ActionButtonsProps {
  verifiedCorrect: boolean;
  onVerifiedChange: (verified: boolean) => void;
  isActive: boolean;
  onActivate: () => void;
  onReject: () => void;
}

// Botones para activar o rechazar usuario con verificación
export function ActionButtons({
  verifiedCorrect,
  onVerifiedChange,
  isActive,
  onActivate,
  onReject,
}: ActionButtonsProps) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-4 gap-3">
        <Pressable
          onPress={() => onVerifiedChange(!verifiedCorrect)}
          className={`w-6 h-6 rounded border-2 items-center justify-center ${verifiedCorrect ? 'bg-primary border-primary' : 'border-border bg-white'}`}
        >
          {verifiedCorrect && <Text className="text-white text-sm font-bold">✓</Text>}
        </Pressable>
        <Text className="flex-1 text-sm text-text leading-5">
          Verifiqué que toda la información y documentos están correctos
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onActivate}
          disabled={!verifiedCorrect || isActive}
          className={`flex-1 py-3.5 rounded-lg items-center ${(!verifiedCorrect || isActive) ? 'bg-primary/50' : 'bg-primary active:bg-primary/90'}`}
        >
          <Text className="text-white text-base font-semibold">Activar repartidor</Text>
        </Pressable>

        {!isActive && (
          <Pressable
            onPress={onReject}
            className="flex-1 py-3.5 rounded-lg items-center bg-red-600 active:bg-red-700"
          >
            <Text className="text-white text-base font-semibold">Rechazar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}