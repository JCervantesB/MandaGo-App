import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard } from 'lucide-react-native';
import { useWallet } from '@/hooks/use-wallet';
import { appColors } from '@/theme/theme';
import { formatDateTime } from '@/utils/date-formatters';
import type { TransactionType } from '@/types/shipment-types';

interface TopupPackage {
  credits: 100 | 200 | 500;
  label: string;
  price: number;
}

const TOPUP_PACKAGES: TopupPackage[] = [
  { credits: 100, label: 'Basic', price: 100 },
  { credits: 200, label: 'Standard', price: 200 },
  { credits: 500, label: 'Premium', price: 500 },
];

const TRANSACTION_LABELS: Record<TransactionType, { label: string; color: string }> = {
  topup: { label: 'Recarga', color: '#16A34A' },
  service_charge: { label: 'Costo de envío', color: '#DC2626' },
  acceptance_fee: { label: 'Cargo aceptación', color: '#DC2626' },
  delivery_earning: { label: 'Ganancia por entrega', color: '#16A34A' },
  refund: { label: 'Reembolso', color: '#16A34A' },
};

interface WalletScreenProps {
  navigation: any;
  activeScreen?: string;
  BottomNavComponent?: React.ComponentType<{ activeScreen: string; navigation: any }>;
}

export function WalletScreen({ navigation, activeScreen = 'Wallet', BottomNavComponent }: WalletScreenProps) {
  const { balance, transactions, isLoading, fetchBalance, fetchTransactions, topup } = useWallet();
  const [topupLoading, setTopupLoading] = useState<number | null>(null);

  const handleTopup = async (packageCredits: 100 | 200 | 500, price: number) => {
    Alert.alert(
      'Confirmar recarga',
      `¿Deseas comprar ${packageCredits} créditos por $${price} MXN?\n\nEsta es una simulación (no real).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setTopupLoading(packageCredits);
            try {
              const result = await topup(packageCredits);
              Alert.alert('Éxito', `${packageCredits} créditos añadidos a tu cartera.\n\nNuevo saldo: ${result.balance} créditos`);
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Error al recargar';
              Alert.alert('Error', message);
            } finally {
              setTopupLoading(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-2xl p-6 border border-border mb-6 items-center">
            <Text className="text-sm font-medium text-text/60 mb-1">Saldo disponible</Text>
            <Text className="text-5xl font-bold text-primary">{balance}</Text>
            <Text className="text-sm text-text/50 mt-1">créditos</Text>
          </View>

          <Text className="text-lg font-bold text-text mb-3">Recargar créditos</Text>
          <View className="flex-row gap-3 mb-6">
            {TOPUP_PACKAGES.map((pkg) => (
              <Pressable
                key={pkg.credits}
                onPress={() => handleTopup(pkg.credits, pkg.price)}
                disabled={topupLoading !== null}
                className="flex-1 bg-white rounded-xl p-4 border border-border items-center"
              >
                {topupLoading === pkg.credits ? (
                  <ActivityIndicator color={appColors.primary} />
                ) : (
                  <>
                    <Text className="text-2xl font-bold text-primary">{pkg.credits}</Text>
                    <Text className="text-xs text-text/60 mt-1">créditos</Text>
                    <View className="mt-2 px-3 py-1 bg-success/10 rounded-full">
                      <Text className="text-sm font-semibold text-success">${pkg.price} MXN</Text>
                    </View>
                    <Text className="text-xs text-text/50 mt-2">{pkg.label}</Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-text">Historial</Text>
            <Pressable onPress={fetchTransactions} disabled={isLoading}>
              <Text className="text-sm font-medium text-primary">Actualizar</Text>
            </Pressable>
          </View>

          {isLoading && transactions.length === 0 ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={appColors.primary} />
              <Text className="text-sm text-text/60 mt-2">Cargando historial...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View className="py-8 items-center">
              <CreditCard size={40} color="#9CA3AF" className="mb-3" />
              <Text className="text-base font-medium text-text/70">Sin transacciones</Text>
              <Text className="text-sm text-text/50 mt-1">Tu historial aparecerá aquí</Text>
            </View>
          ) : (
            <View className="gap-3">
              {transactions.map((tx) => {
                const labelInfo = TRANSACTION_LABELS[tx.tipo] ?? { label: tx.tipo, color: '#6B7280' };
                const isPositive = tx.monto > 0;

                return (
                  <View
                    key={tx.id}
                    className="bg-white rounded-xl p-4 border border-border flex-row items-center"
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: (isPositive ? '#16A34A' : '#DC2626') + '15' }}
                    >
                      <Text className="text-lg">{isPositive ? '+' : '-'}</Text>
                    </View>
                    <View className="flex-1 ml-3">
                      <View className="flex-row justify-between">
                        <Text className="text-sm font-semibold text-text">{labelInfo.label}</Text>
                        <Text
                          className="text-sm font-bold"
                          style={{ color: isPositive ? '#16A34A' : '#DC2626' }}
                        >
                          {isPositive ? '+' : ''}{tx.monto}
                        </Text>
                      </View>
                      <Text className="text-xs text-text/50 mt-0.5">
                        {formatDateTime(tx.createdAt)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      {BottomNavComponent && <BottomNavComponent activeScreen={activeScreen} navigation={navigation} />}
    </View>
  );
}