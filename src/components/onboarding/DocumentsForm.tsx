import { Text, View } from 'react-native';
import { DocumentPicker, type Base64DocumentInput } from '@/components/common/DocumentPicker';
import type { FieldErrors } from '@/validation/schemas/onboarding.schema';

export interface DocumentsFormProps {
  ine: Base64DocumentInput | null;
  driverLicense: Base64DocumentInput | null;
  vehiclePhoto: Base64DocumentInput | null;
  errors: FieldErrors;
  onIneChange: (doc: Base64DocumentInput) => void;
  onDriverLicenseChange: (doc: Base64DocumentInput) => void;
  onVehiclePhotoChange: (doc: Base64DocumentInput) => void;
  onErrorClear: (field: string) => void;
}

// Formulario de documentos (INE, licencia, foto del vehículo)
export function DocumentsForm({
  ine,
  driverLicense,
  vehiclePhoto,
  errors,
  onIneChange,
  onDriverLicenseChange,
  onVehiclePhotoChange,
  onErrorClear,
}: DocumentsFormProps) {
  return (
    <>
      <View className="gap-1.5">
        <Text className="text-sm font-semibold text-text">INE (Identificación oficial)</Text>
        <DocumentPicker
          document={ine}
          onSelect={(doc) => {
            onIneChange(doc);
            onErrorClear('ine');
          }}
          error={errors.ine as string | undefined}
          placeholder="Toca para agregar INE"
        />
        {errors.ine && <Text className="text-xs text-error">{errors.ine}</Text>}
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-semibold text-text">Licencia de Conducir</Text>
        <DocumentPicker
          document={driverLicense}
          onSelect={(doc) => {
            onDriverLicenseChange(doc);
            onErrorClear('driverLicense');
          }}
          error={errors.driverLicense as string | undefined}
          placeholder="Toca para agregar licencia"
        />
        {errors.driverLicense && <Text className="text-xs text-error">{errors.driverLicense}</Text>}
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-semibold text-text">Foto del Vehículo</Text>
        <DocumentPicker
          document={vehiclePhoto}
          onSelect={(doc) => {
            onVehiclePhotoChange(doc);
            onErrorClear('vehiclePhoto');
          }}
          error={errors.vehiclePhoto as string | undefined}
          placeholder="Toca para agregar foto del vehículo"
        />
        {errors.vehiclePhoto && <Text className="text-xs text-error">{errors.vehiclePhoto}</Text>}
      </View>
    </>
  );
}