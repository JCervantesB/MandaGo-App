import { Text, TextInput, View } from 'react-native';
import type { FieldErrors } from '@/validation/schemas/onboarding.schema';
import { appColors } from '@/theme/theme';

export interface BusinessFormProps {
  businessName: string;
  rfc: string;
  errors: FieldErrors;
  onBusinessNameChange: (value: string) => void;
  onRfcChange: (value: string) => void;
}

// Formulario de datos comerciales (nombre del negocio, RFC)
export function BusinessForm({
  businessName,
  rfc,
  errors,
  onBusinessNameChange,
  onRfcChange,
}: BusinessFormProps) {
  return (
    <>
      <View className="gap-1.5">
        <Text className="text-sm font-semibold text-text">Nombre Comercial</Text>
        <TextInput
          className={`border rounded-lg p-3 text-base text-text bg-white ${errors.businessName ? 'border-error' : 'border-border'}`}
          value={businessName}
          onChangeText={onBusinessNameChange}
          placeholder="Ej: Taquería Los Hermanos"
          placeholderTextColor={appColors.textSoft}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {errors.businessName && <Text className="text-xs text-error">{errors.businessName}</Text>}
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-semibold text-text">RFC</Text>
        <TextInput
          className={`border rounded-lg p-3 text-base text-text bg-white ${errors.rfc ? 'border-error' : 'border-border'}`}
          value={rfc}
          onChangeText={(text) => onRfcChange(text.toUpperCase())}
          placeholder="XAXX010101000"
          placeholderTextColor={appColors.textSoft}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={13}
        />
        {errors.rfc && <Text className="text-xs text-error">{errors.rfc}</Text>}
      </View>
    </>
  );
}