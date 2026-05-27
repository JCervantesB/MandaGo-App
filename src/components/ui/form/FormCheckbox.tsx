import { Pressable, Text, View } from 'react-native';

export interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// Casilla de verificación para formularios
export function FormCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
}: FormCheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      className={`flex-row items-center gap-3 ${disabled ? 'opacity-50' : ''}`}
    >
      <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${checked ? 'bg-primary border-primary' : 'border-border bg-white'}`}>
        {checked && <Text className="text-white text-sm font-bold">✓</Text>}
      </View>
      <Text className={`text-sm text-text flex-1 ${disabled ? 'text-disabled' : ''}`}>{label}</Text>
    </Pressable>
  );
}