import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import type { ShipmentStep } from './ShipmentStepIndicator';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.65;
const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.18;

interface CustomerShipmentBottomSheetProps {
  step: ShipmentStep;
  onStepChange: (step: ShipmentStep) => void;
  completedSteps: ShipmentStep[];
  children: React.ReactNode;
  canContinue: boolean;
  onContinue: () => void;
  isLoading?: boolean;
  routeInfo?: { distance: number; duration: number } | null;
}

// Hoja inferior con pasos para la creación de envíos (expandible/colapsable)
export function CustomerShipmentBottomSheet({
  step,
  completedSteps,
  children,
  canContinue,
  onContinue,
  isLoading = false,
  routeInfo,
}: CustomerShipmentBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const animatedHeight = useRef(new Animated.Value(MAX_HEIGHT)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? COLLAPSED_HEIGHT : MAX_HEIGHT;
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const stepLabels: Record<ShipmentStep, string> = {
    addresses: 'Direcciones',
    package: 'Paquete',
    recipient: 'Destinatario',
    review: 'Revisar',
  };

  const isReview = step === 'review';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: animatedHeight,
        },
      ]}
    >
      <View style={styles.handleContainer}>
        <Pressable onPress={toggleExpand} style={styles.handlePressable}>
          <View style={styles.handle} />
        </Pressable>

        <View className="items-center px-4 pt-2 pb-1">
          <Pressable onPress={toggleExpand} className="flex-row items-center">
            <Text className="text-base font-bold text-text">{stepLabels[step]}</Text>
            {isExpanded ? (
              <ChevronDown size={20} color={appColors.textMuted} className="ml-2" />
            ) : (
              <ChevronUp size={20} color={appColors.textMuted} className="ml-2" />
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.stepIndicatorContainer}>
        <View className="flex-row items-center">
          {(['addresses', 'package', 'recipient', 'review'] as ShipmentStep[]).map((s, i) => {
            const isCompleted = completedSteps.includes(s);
            const isCurrent = s === step;
            return (
              <React.Fragment key={s}>
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    isCurrent ? 'bg-primary' : isCompleted ? 'bg-success' : 'bg-border'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Text className="text-white text-xs">✓</Text>
                  ) : (
                    <Text className={`text-white text-xs font-bold`}>{i + 1}</Text>
                  )}
                </View>
                {i < 3 && (
                  <View className={`flex-1 h-0.5 mx-1 ${isCompleted ? 'bg-success' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.footer}>
        {!isExpanded && routeInfo && (
          <View className="flex-row items-center px-4 mb-2">
            <Text className="text-xs text-textMuted">
              {(routeInfo.distance / 1000).toFixed(1)} km • {Math.round(routeInfo.duration / 60)} min
            </Text>
          </View>
        )}

        <Pressable
          onPress={onContinue}
          disabled={!canContinue || isLoading}
          className={`mx-4 mb-4 py-4 rounded-xl items-center ${
            !canContinue || isLoading ? 'bg-border' : 'bg-success'
          }`}
        >
          {isLoading ? (
            <Text>...</Text>
          ) : (
            <Text className="text-white text-base font-semibold">
              {isReview ? 'Crear envío' : 'Continuar'}
            </Text>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  handlePressable: {
    paddingVertical: 8,
    paddingHorizontal: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  stepIndicatorContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
});