import { Text, TextInput, View } from 'react-native';
import { appColors } from '@/theme/theme';

export interface FormPhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// Campo de teléfono con formato automático (XXX) XXX-XXXX
export function FormPhoneInput({ label, value, onChange, error }: FormPhoneInputProps) {
  const formatPhone = (text: string): string => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    const truncated = digits.slice(0, 10);
    onChange(formatPhone(truncated));
  };

  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-semibold text-text">{label}</Text>}
      <TextInput
        className={`border rounded-lg p-3 text-base text-text bg-white ${error ? 'border-error' : 'border-border'}`}
        value={value}
        onChangeText={handleChange}
        placeholder="(55) 1234-5678"
        placeholderTextColor={appColors.textSoft}
        keyboardType="phone-pad"
        maxLength={15}
      />
      {error && <Text className="text-xs text-error">{error}</Text>}
    </View>
  );
}