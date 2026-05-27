import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useServiceFees, type ServiceFee } from '@/hooks/use-service-fees';
import { appColors } from '@/theme/theme';

interface ServiceFeesEditorProps {
  onClose?: () => void;
}

// Editor de tarifas de servicio por prioridad
export function ServiceFeesEditor({ onClose }: ServiceFeesEditorProps) {
  const { fees, isLoading, isSaving, error, refetch, updateFee } = useServiceFees();
  const [editingFee, setEditingFee] = useState<ServiceFee | null>(null);
  const [creditsValue, setCreditsValue] = useState('');
  const [operationFeeValue, setOperationFeeValue] = useState('');

  // Iniciar edición de una tarifa existente
  const startEdit = (fee: ServiceFee) => {
    setEditingFee(fee);
    setCreditsValue(fee.credits.toString());
    setOperationFeeValue(fee.operationFee.toString());
  };

  // Cancelar edición de una tarifa existente
  const cancelEdit = () => {
    setEditingFee(null);
    setCreditsValue('');
    setOperationFeeValue('');
  };

  // Guardar cambios en una tarifa existente
  const handleSave = async () => {
    if (!editingFee) return;
    const credits = parseInt(creditsValue, 10);
    const operationFee = parseInt(operationFeeValue, 10);
    if (isNaN(credits) || credits < 1 || isNaN(operationFee) || operationFee < 0) {
      Alert.alert('Error', 'Ingresa valores válidos');
      return;
    }

    // Actualizar la tarifa existente
    const success = await updateFee(editingFee.priority, credits, operationFee);
    if (success) {
      setEditingFee(null);
      setCreditsValue('');
      setOperationFeeValue('');
    } else {
      Alert.alert('Error', 'No se pudo guardar el costo');
    }
  };

  if (isLoading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator color={appColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-surface border border-border rounded-2xl p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-extrabold text-text">Costos por servicio</Text>
          {onClose && (
            <Pressable onPress={onClose}>
              <Text className="text-sm font-semibold text-text/60">Cerrar</Text>
            </Pressable>
          )}
        </View>
        <Text className="text-sm text-error">Error: {error}</Text>
        <Pressable onPress={() => void refetch()} className="mt-2 py-2 px-4 bg-primary rounded-lg">
          <Text className="text-white text-sm font-semibold">Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (fees.length === 0) {
    return (
      <View className="bg-surface border border-border rounded-2xl p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-extrabold text-text">Costos por servicio</Text>
          {onClose && (
            <Pressable onPress={onClose}>
              <Text className="text-sm font-semibold text-text/60">Cerrar</Text>
            </Pressable>
          )}
        </View>
        <Text className="text-sm text-text-muted mb-4">
          Define el costo del envío y la comisión operativa para cada prioridad.
        </Text>
        <Text className="text-sm text-text-muted">No hay costos configurados. Ejecuta el seed del servidor.</Text>
      </View>
    );
  }

  return (
    <View className="bg-surface border border-border rounded-2xl p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-extrabold text-text">Costos por servicio</Text>
        {onClose && (
          <Pressable onPress={onClose}>
            <Text className="text-sm font-semibold text-text/60">Cerrar</Text>
          </Pressable>
        )}
      </View>

      <Text className="text-sm text-text-muted mb-4">
        Define el costo del envío y la comisión operativa para cada prioridad.
      </Text>

      <View className="gap-3">
        {fees.map((fee) => (
          <View
            key={fee.id}
            className="bg-white rounded-xl p-3 border border-border"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-sm font-semibold text-text">{fee.label}</Text>
                <Text className="text-xs text-text/60 mt-0.5">Prioridad: {fee.priority}</Text>
              </View>
            </View>

            {editingFee?.priority === fee.priority ? (
              <View className="mt-2">
                <View className="flex-row items-center gap-2 mb-2">
                  <Text className="text-xs text-text/60 w-20">Costo envío</Text>
                  <TextInput
                    className="border border-border rounded-lg px-3 py-1.5 w-20 text-center text-sm text-text bg-white"
                    value={creditsValue}
                    onChangeText={setCreditsValue}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                  <Text className="text-xs text-text/60">créditos</Text>
                </View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Text className="text-xs text-text/60 w-20">Comisión</Text>
                  <TextInput
                    className="border border-border rounded-lg px-3 py-1.5 w-20 text-center text-sm text-text bg-white"
                    value={operationFeeValue}
                    onChangeText={setOperationFeeValue}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                  <Text className="text-xs text-text/60">créditos</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={handleSave}
                    disabled={isSaving}
                    className="bg-primary px-3 py-1.5 rounded-lg"
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white text-xs font-semibold">Guardar</Text>
                    )}
                  </Pressable>
                  <Pressable onPress={cancelEdit} className="px-2 py-1.5">
                    <Text className="text-xs text-text/60">Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between mt-1">
                <View className="flex-row items-center gap-3">
                  <Text className="text-sm text-text/60">Envío:</Text>
                  <Text className="text-base font-bold text-primary">{fee.credits} créditos</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-sm text-text/60">Comisión:</Text>
                  <Text className="text-base font-bold text-warning">{fee.operationFee} créditos</Text>
                </View>
                <Pressable
                  onPress={() => startEdit(fee)}
                  className="px-2 py-1 bg-primary/10 rounded-lg"
                >
                  <Text className="text-xs text-primary font-semibold">Editar</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}