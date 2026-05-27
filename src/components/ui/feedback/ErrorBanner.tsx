import { useEffect } from 'react';
import { Animated, Pressable, Text } from 'react-native';

export interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

// Banner de error con autodescartado opcional
export function ErrorBanner({
  message,
  onDismiss,
  autoDismissMs = 4000,
}: ErrorBannerProps) {
  useEffect(() => {
    if (!onDismiss) return;

    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  return (
    <Animated.View className="bg-error flex-row items-center py-3 px-4">
      <Text className="flex-1 text-sm font-medium text-white" numberOfLines={2}>
        {message}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} className="ml-3 p-1">
          <Text className="text-xl font-semibold text-white leading-5">×</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}