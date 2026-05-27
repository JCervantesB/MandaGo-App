import { Pressable, Text, View } from 'react-native';
import { VEHICLE_TYPES } from '@/constants/vehicle-types';

export interface VehicleFormProps {
  vehicleType: string;
  errors: { vehicleType?: string };
  onVehicleTypeChange: (value: string) => void;
  onErrorClear: (field: string) => void;
}

// Selector de tipo de vehículo para registro de repartidor
export function VehicleForm({
  vehicleType,
  errors,
  onVehicleTypeChange,
  onErrorClear,
}: VehicleFormProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-text">Selecciona tu vehículo</Text>
      <View className="flex-row flex-wrap gap-2.5">
        {VEHICLE_TYPES.map((type) => (
          <Pressable
            key={type.value}
            onPress={() => {
              onVehicleTypeChange(type.value);
              onErrorClear('vehicleType');
            }}
            className={`py-2.5 px-4 rounded-lg border ${vehicleType === type.value ? 'border-primary bg-primary' : 'border-border bg-white'}`}
          >
            <Text className={`text-sm font-medium ${vehicleType === type.value ? 'text-white' : 'text-text'}`}>
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.vehicleType && <Text className="text-xs text-error">{errors.vehicleType}</Text>}
    </View>
  );
}