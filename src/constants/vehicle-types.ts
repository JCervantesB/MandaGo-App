import { Bike, Utensils, Car, Truck } from 'lucide-react-native';

export interface VehicleTypeOption {
  value: string;
  label: string;
  Icon?: React.ComponentType<any>;
}

export const VEHICLE_TYPES: VehicleTypeOption[] = [
  { value: 'bicicleta', label: 'Bicicleta', Icon: Bike },
  { value: 'motocicleta', label: 'Motocicleta', Icon: Utensils },
  { value: 'coche', label: 'Coche', Icon: Car },
  { value: 'camioneta', label: 'Camioneta', Icon: Truck },
];

export function getVehicleLabel(value: string): string {
  return VEHICLE_TYPES.find(v => v.value === value)?.label ?? value;
}