import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

// Selector desplegable para formularios
export function FormSelect({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Seleccionar...',
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <View className="gap-1.5">
        <Text className="text-sm font-semibold text-text">{label}</Text>
        <Pressable
          onPress={() => setIsOpen(true)}
          className={`flex-row items-center justify-between border rounded-lg p-3 bg-white ${error ? 'border-error' : 'border-border'}`}
        >
          <Text className={`text-base ${!selectedOption ? 'text-text/50' : 'text-text'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Text className="text-xs text-text/50">▼</Text>
        </Pressable>
        {error && <Text className="text-xs text-error">{error}</Text>}
      </View>

      <Modal transparent visible={isOpen} animationType="fade">
        <Pressable className="flex-1 bg-black/50 justify-center items-center p-5" onPress={() => setIsOpen(false)}>
          <View className="bg-white rounded-xl w-full max-h-80 p-4">
            <Text className="text-base font-semibold text-text mb-3 text-center">{label}</Text>
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => { onChange(option.value); setIsOpen(false); }}
                className={`py-3 border-b border-border ${option.value === value ? 'bg-primary rounded-lg mx-1 my-0.5' : ''}`}
              >
                <Text className={`text-base ${option.value === value ? 'text-white font-medium' : 'text-text'}`}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}