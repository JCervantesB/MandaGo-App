export type TransactionType =
  | 'topup'
  | 'charge'
  | 'earning'
  | 'refund'
  | 'payout'
  | 'service_charge'
  | 'acceptance_fee'
  | 'delivery_earning';

export interface TransactionItem {
  id: number;
  userId: string;
  tipo: TransactionType;
  monto: number;
  orderId: number | null;
  providerTransactionId: string | null;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

export interface WalletTransaction {
  id: number;
  userId: string;
  tipo: TransactionType;
  monto: number;
  balanceAfter: number;
  orderId: number | null;
  providerTransactionId: string | null;
  createdAt: string;
}

export interface WalletBalance {
  balance: number;
  pendingBalance?: number;
}

export interface WalletTopupPackage {
  id: string;
  credits: number;
  priceMxn: number;
  label: string;
}

export const TOPUP_PACKAGES: WalletTopupPackage[] = [
  { id: 'package_1', credits: 100, priceMxn: 100, label: '100 créditos' },
  { id: 'package_2', credits: 250, priceMxn: 220, label: '250 créditos' },
  { id: 'package_3', credits: 500, priceMxn: 400, label: '500 créditos' },
  { id: 'package_4', credits: 1000, priceMxn: 750, label: '1000 créditos' },
];