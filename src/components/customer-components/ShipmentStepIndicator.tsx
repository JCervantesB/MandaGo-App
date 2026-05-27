import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';

export type ShipmentStep = 'addresses' | 'package' | 'recipient' | 'review';

interface StepConfig {
  key: ShipmentStep;
  label: string;
}

const STEPS: StepConfig[] = [
  { key: 'addresses', label: 'Direcciones' },
  { key: 'package', label: 'Paquete' },
  { key: 'recipient', label: 'Destinatario' },
  { key: 'review', label: 'Revisar' },
];

interface ShipmentStepIndicatorProps {
  currentStep: ShipmentStep;
  onStepPress?: (step: ShipmentStep) => void;
  completedSteps?: ShipmentStep[];
}

// Indicador de pasos para la creación de envíos (Direcciones > Paquete > Destinatario > Revisar)
export function ShipmentStepIndicator({
  currentStep,
  onStepPress,
  completedSteps = [],
}: ShipmentStepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <View className="px-4 py-3 bg-white border-b border-border">
      <View className="flex-row items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = step.key === currentStep;
          const isPast = index < currentIndex;

          return (
            <React.Fragment key={step.key}>
              <Pressable
                onPress={() => onStepPress?.(step.key)}
                className="flex-1 items-center"
                disabled={!onStepPress}
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
                    isCurrent
                      ? 'border-primary bg-primary'
                      : isPast || isCompleted
                        ? 'border-success bg-success'
                        : 'border-border bg-white'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={14} color="white" />
                  ) : (
                    <Text
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-white' : isPast ? 'text-white' : 'text-textMuted'
                      }`}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  className={`text-xs mt-1.5 ${
                    isCurrent ? 'text-primary font-semibold' : 'text-textMuted'
                  }`}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </Pressable>

              {index < STEPS.length - 1 && (
                <View
                  className={`flex-1 h-0.5 mx-1 ${
                    isPast || isCompleted ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}