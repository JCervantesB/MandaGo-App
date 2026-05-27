import { Pressable, Text, View } from 'react-native';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, DollarSign } from 'lucide-react-native';
import type { TransactionItem } from '@/hooks/use-admin-transactions';
import { formatDateTime } from '@/utils/date-formatters';

// Configuración de tipos de transacción
const TYPE_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  topup: { label: 'Recarga', color: '#16A34A', Icon: ArrowUpCircle },
  service_charge: { label: 'Cargo de servicio', color: '#DC2626', Icon: ArrowDownCircle },
  acceptance_fee: { label: 'Cargo de aceptación', color: '#DC2626', Icon: ArrowDownCircle },
  delivery_earning: { label: 'Ganancia por entrega', color: '#16A34A', Icon: DollarSign },
  earning: { label: 'Ganancia', color: '#16A34A', Icon: DollarSign },
  refund: { label: 'Reembolso', color: '#3B82F6', Icon: RefreshCw },
  payout: { label: 'Pago', color: '#8B5CF6', Icon: DollarSign },
};

interface CreditTransactionCardProps {
  transaction: TransactionItem;
  onPress?: () => void;
}

// Tarjeta de transacción de crédito para el historial del admin
export function CreditTransactionCard({ transaction, onPress }: CreditTransactionCardProps) {
  const config = TYPE_CONFIG[transaction.tipo] ?? { label: transaction.tipo, color: '#6B7280', Icon: DollarSign };
  const { Icon } = config;
  const isPositive = ['topup', 'delivery_earning', 'earning', 'refund'].includes(transaction.tipo);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 border border-border mb-2 flex-row items-center"
      disabled={!onPress}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: config.color + '20' }}
      >
        <Icon size={20} color={config.color} />
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-sm font-semibold text-text">{config.label}</Text>
            <Text className="text-xs text-text/60 mt-0.5">{transaction.userName ?? 'Sin nombre'}</Text>
            <Text className="text-xs text-text/60">{transaction.userEmail ?? 'Sin email'}</Text>
          </View>
          <Text className={`text-base font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : '-'}{Math.abs(transaction.monto)} créditos
          </Text>
        </View>

        {transaction.orderId && (
          <Text className="text-xs text-text/50 mt-1">Orden #{transaction.orderId}</Text>
        )}
        {transaction.providerTransactionId && (
          <Text className="text-xs text-text/50 mt-0.5">Ref: {transaction.providerTransactionId}</Text>
        )}
        <Text className="text-xs text-text/50 mt-0.5">{formatDateTime(transaction.createdAt)}</Text>
      </View>
    </Pressable>
  );
}