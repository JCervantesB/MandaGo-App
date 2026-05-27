import { Pressable, Text, View } from 'react-native';
import { VEHICLE_TYPES } from '@/constants/vehicle-types';

export interface VehicleTypeSelectorProps {
  selected: string;
  onSelect: (value: string) => void;
  error?: string;
}

// Selector visual de tipo de vehículo con iconos
export function VehicleTypeSelector({
  selected,
  onSelect,
  error,
}: VehicleTypeSelectorProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-text">Tipo de vehículo</Text>
      <View className="flex-row flex-wrap gap-2.5">
        {VEHICLE_TYPES.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            className={`flex-1 min-w-[45%] flex-row items-center gap-2 p-3 rounded-lg border ${selected === option.value ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}
          >
            <option.Icon size={20} color={selected === option.value ? '#2563EB' : '#6B7280'} />
            <Text className={`text-sm font-medium ${selected === option.value ? 'text-primary' : 'text-text'}`}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && <Text className="text-xs text-error">{error}</Text>}
    </View>
  );
}