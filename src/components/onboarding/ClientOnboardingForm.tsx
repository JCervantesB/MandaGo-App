import { Pressable, Text, TextInput, View } from 'react-native';
import { type FieldErrors } from '@/validation/schemas';
import { appColors } from '@/theme/theme';

interface ClientOnboardingFormProps {
  street: string;
  streetNumber: string;
  postalCode: string;
  colony: string;
  city: string;
  state: string;
  rfc: string;
  businessName: string;
  errors: FieldErrors;
  isSubmitting: boolean;
  onStreetChange: (v: string) => void;
  onStreetNumberChange: (v: string) => void;
  onPostalCodeChange: (v: string) => void;
  onColonyChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onRfcChange: (v: string) => void;
  onBusinessNameChange: (v: string) => void;
  onErrorsChange: (e: FieldErrors) => void;
  onSubmit: () => Promise<void>;
}

// Formulario de registro para clientes (dirección, RFC, razón social)
export function ClientOnboardingForm({
  street, streetNumber, postalCode, colony, city, state, rfc, businessName,
  errors, isSubmitting,
  onStreetChange, onStreetNumberChange, onPostalCodeChange, onColonyChange,
  onCityChange, onStateChange, onRfcChange, onBusinessNameChange,
  onErrorsChange, onSubmit,
}: ClientOnboardingFormProps) {
  return (
    <View className="gap-4">
      <View className="gap-4">
        <View className="gap-1.5">
          <Text className="text-sm font-semibold text-text">Nombre comercial</Text>
          <TextInput
            className={`border rounded-xl p-3 text-base text-text bg-white ${
              errors.businessName ? 'border-error' : 'border-border'
            }`}
            value={businessName}
            onChangeText={(v) => {
              onBusinessNameChange(v);
              onErrorsChange({ ...errors, businessName: undefined });
            }}
            placeholder="Ej. Taquería Los Hermanos"
            placeholderTextColor={appColors.textSoft}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {errors.businessName && (
            <Text className="text-xs text-error">{errors.businessName}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-semibold text-text">RFC</Text>
          <TextInput
            className={`border rounded-xl p-3 text-base text-text bg-white ${
              errors.rfc ? 'border-error' : 'border-border'
            }`}
            value={rfc}
            onChangeText={(v) => {
              onRfcChange(v.toUpperCase());
              onErrorsChange({ ...errors, rfc: undefined });
            }}
            placeholder="XAXX010101000"
            placeholderTextColor={appColors.textSoft}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={13}
          />
          {errors.rfc && <Text className="text-xs text-error">{errors.rfc}</Text>}
        </View>
      </View>

      <View className="h-px bg-border" />

      <View className="gap-1">
        <Text className="text-base font-bold text-text">Dirección</Text>
        <Text className="text-sm text-text-muted">
          Indica la ubicación principal de tu negocio.
        </Text>
      </View>

      <View className="gap-3">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Calle</Text>
            <TextInput
              className={`border rounded-xl p-3 text-base text-text bg-white ${
                errors.street ? 'border-error' : 'border-border'
              }`}
              value={street}
              onChangeText={(v) => {
                onStreetChange(v);
                onErrorsChange({ ...errors, street: undefined });
              }}
              placeholder="Av. Principal"
              placeholderTextColor={appColors.textSoft}
              autoCapitalize="words"
            />
            {errors.street && <Text className="text-xs text-error">{errors.street}</Text>}
          </View>

          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">No. Ext.</Text>
            <TextInput
              className={`border rounded-xl p-3 text-base text-text bg-white ${
                errors.street ? 'border-error' : 'border-border'
              }`}
              value={streetNumber}
              onChangeText={onStreetNumberChange}
              placeholder="123"
              placeholderTextColor={appColors.textSoft}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Código postal</Text>
            <TextInput
              className={`border rounded-xl p-3 text-base text-text bg-white ${
                errors.postalCode ? 'border-error' : 'border-border'
              }`}
              value={postalCode}
              onChangeText={(v) => {
                onPostalCodeChange(v.replace(/[^0-9]/g, '').slice(0, 5));
                onErrorsChange({ ...errors, postalCode: undefined });
              }}
              placeholder="55000"
              placeholderTextColor={appColors.textSoft}
              keyboardType="number-pad"
              maxLength={5}
            />
            {errors.postalCode && (
              <Text className="text-xs text-error">{errors.postalCode}</Text>
            )}
          </View>

          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Colonia</Text>
            <TextInput
              className={`border rounded-xl p-3 text-base text-text bg-white ${
                errors.colony ? 'border-error' : 'border-border'
              }`}
              value={colony}
              onChangeText={(v) => {
                onColonyChange(v);
                onErrorsChange({ ...errors, colony: undefined });
              }}
              placeholder="Centro"
              placeholderTextColor={appColors.textSoft}
              autoCapitalize="words"
            />
            {errors.colony && <Text className="text-xs text-error">{errors.colony}</Text>}
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Ciudad</Text>
            <TextInput
              className={`border rounded-xl p-3 text-base text-text bg-white ${
                errors.city ? 'border-error' : 'border-border'
              }`}
              value={city}
              onChangeText={(v) => {
                onCityChange(v);
                onErrorsChange({ ...errors, city: undefined });
              }}
              placeholder="Ciudad de México"
              placeholderTextColor={appColors.textSoft}
              autoCapitalize="words"
            />
            {errors.city && <Text className="text-xs text-error">{errors.city}</Text>}
          </View>

          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Estado</Text>
            <TextInput
              className={`border rounded-xl p-3 text-base text-text bg-white ${
                errors.state ? 'border-error' : 'border-border'
              }`}
              value={state}
              onChangeText={(v) => {
                onStateChange(v);
                onErrorsChange({ ...errors, state: undefined });
              }}
              placeholder="CDMX"
              placeholderTextColor={appColors.textSoft}
              autoCapitalize="words"
            />
            {errors.state && <Text className="text-xs text-error">{errors.state}</Text>}
          </View>
        </View>
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={isSubmitting}
        className={`py-4 px-4 rounded-xl items-center justify-center mt-2 ${
          isSubmitting ? 'opacity-60 bg-primary' : 'bg-primary active:bg-primary-pressed'
        }`}
      >
        <Text className="text-white text-base font-semibold">
          {isSubmitting ? 'Guardando...' : 'Completar registro'}
        </Text>
      </Pressable>
    </View>
  );
}