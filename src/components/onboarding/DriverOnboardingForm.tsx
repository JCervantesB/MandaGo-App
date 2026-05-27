import { Pressable, Text, TextInput, View } from 'react-native';
import type { Base64DocumentInput } from '@/components/common/DocumentPicker';
import { VehicleForm } from '@/components/onboarding/VehicleForm';
import { DocumentsForm } from '@/components/onboarding/DocumentsForm';
import type { FieldErrors } from '@/validation/schemas';

interface DriverOnboardingFormProps {
  street: string;
  streetNumber: string;
  postalCode: string;
  colony: string;
  city: string;
  state: string;
  vehicleType: string;
  ine: Base64DocumentInput | null;
  driverLicense: Base64DocumentInput | null;
  vehiclePhoto: Base64DocumentInput | null;
  errors: FieldErrors;
  isSubmitting: boolean;
  onStreetChange: (v: string) => void;
  onStreetNumberChange: (v: string) => void;
  onPostalCodeChange: (v: string) => void;
  onColonyChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onVehicleTypeChange: (v: string) => void;
  onIneChange: (doc: Base64DocumentInput) => void;
  onDriverLicenseChange: (doc: Base64DocumentInput) => void;
  onVehiclePhotoChange: (doc: Base64DocumentInput) => void;
  onErrorsChange: (e: FieldErrors) => void;
  onSubmit: () => Promise<void>;
}

// Formulario de registro para repartidores (dirección, vehículo, documentos)
export function DriverOnboardingForm({
  street, postalCode, colony, city, state,
  vehicleType, ine, driverLicense, vehiclePhoto,
  errors, isSubmitting,
  onStreetChange, onPostalCodeChange, onColonyChange,
  onCityChange, onStateChange, onVehicleTypeChange,
  onIneChange, onDriverLicenseChange, onVehiclePhotoChange,
  onErrorsChange, onSubmit,
}: DriverOnboardingFormProps) {
  const clearError = (field: string) => onErrorsChange({ ...errors, [field]: undefined });

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-base font-bold text-text">Dirección</Text>
        <Text className="text-sm text-text-muted">
          Completa la información de tu domicilio actual.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1.5">
          <Text className="text-sm font-semibold text-text">Calle y número</Text>
          <TextInput
            className={`border rounded-xl p-3 text-base text-text bg-white ${
              errors.street ? 'border-error' : 'border-border'
            }`}
            value={street}
            onChangeText={(v) => { onStreetChange(v); clearError('street'); }}
            placeholder="Av. Principal 123"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
          {errors.street && <Text className="text-xs text-error">{errors.street}</Text>}
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
                clearError('postalCode');
              }}
              placeholder="55000"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={5}
            />
            {errors.postalCode && (
              <Text className="text-xs text-error">{errors.postalCode}</Text>
            )}
          </View>

          <View className="flex-[2] gap-1.5">
            <Text className="text-sm font-semibold text-text">Colonia</Text>
            <TextInput
              className={`border rounded-xl p-3 text-base text-text bg-white ${
                errors.colony ? 'border-error' : 'border-border'
              }`}
              value={colony}
              onChangeText={(v) => { onColonyChange(v); clearError('colony'); }}
              placeholder="Centro"
              placeholderTextColor="#9CA3AF"
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
              onChangeText={(v) => { onCityChange(v); clearError('city'); }}
              placeholder="Ciudad de México"
              placeholderTextColor="#9CA3AF"
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
              onChangeText={(v) => { onStateChange(v); clearError('state'); }}
              placeholder="CDMX"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
            {errors.state && <Text className="text-xs text-error">{errors.state}</Text>}
          </View>
        </View>
      </View>

      <View className="h-px bg-border" />

      <View className="gap-1">
        <Text className="text-base font-bold text-text">Vehículo</Text>
        <Text className="text-sm text-text-muted">
          Selecciona el tipo de vehículo con el que realizarás entregas.
        </Text>
      </View>

      <VehicleForm
        vehicleType={vehicleType}
        errors={{ vehicleType: errors.vehicleType }}
        onVehicleTypeChange={(v) => { onVehicleTypeChange(v); clearError('vehicleType'); }}
        onErrorClear={clearError}
      />

      <View className="h-px bg-border" />

      <View className="gap-1">
        <Text className="text-base font-bold text-text">Documentos requeridos</Text>
        <Text className="text-sm text-text-muted">
          Sube tus documentos para validar tu cuenta como repartidor.
        </Text>
      </View>

      <DocumentsForm
        ine={ine}
        driverLicense={driverLicense}
        vehiclePhoto={vehiclePhoto}
        errors={errors}
        onIneChange={(doc) => { onIneChange(doc); clearError('ine'); }}
        onDriverLicenseChange={(doc) => { onDriverLicenseChange(doc); clearError('driverLicense'); }}
        onVehiclePhotoChange={(doc) => { onVehiclePhotoChange(doc); clearError('vehiclePhoto'); }}
        onErrorClear={clearError}
      />

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