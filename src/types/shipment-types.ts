export interface Coordinates {
  lat: number;
  lon: number;
}

import type { OrderStatus } from './delivery-order';

export { OrderStatus } from './delivery-order';
export { DeliveryOrder, OrderPriority, STATUS_CONFIG, PRIORITY_CONFIG } from './delivery-order';

export interface PlaceOption {
  id: string;
  formatted: string;
  lat: number;
  lon: number;
  type: 'poi' | 'street' | 'house' | 'city' | 'state' | 'country';
  city?: string;
  street?: string;
  houseNumber?: string;
  postcode?: string;
  country?: string;
  state?: string;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  geometry: Coordinates[];
}

export interface ShipmentFormData {
  origin: PlaceOption | null;
  destination: PlaceOption | null;
  packageDescription: string;
  packageWeight: number;
  packageSize?: 'chico' | 'mediano' | 'grande';
  packageDimensions?: string;
  priority?: 'normal' | 'express' | 'urgente';
  destName: string;
  destPhone: string;
  productType?: 'sin_costo' | 'contra_entrega';
  productAmount?: number;
  notes?: string;
}

export interface GeoapifyAutocompleteResult {
  formatted: string;
  lat: number;
  lon: number;
  type: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface AutocompleteResponse {
  results: GeoapifyAutocompleteResult[];
}

export interface GeoapifyReverseResult {
  formatted: string;
  lat: number;
  lon: number;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface ReverseGeocodeResponse {
  results: GeoapifyReverseResult[];
}

export interface RoutingFeature {
  properties: {
    distance: number;
    duration: number;
  };
  geometry: {
    coordinates: unknown;
  };
}

export interface RoutingResponse {
  features: RoutingFeature[];
}

export interface CustomerShipment {
  id: number;
  publicId: string;
  userId: string;
  driverId: string | null;
  originAddress: string;
  originLat: string;
  originLng: string;
  destAddress: string;
  destLat: string;
  destLng: string;
  destName: string;
  destPhone: string;
  packageDescription: string;
  packageSize: 'chico' | 'mediano' | 'grande';
  packageWeight: string | null;
  packageDimensions: string | null;
  priority: 'normal' | 'express' | 'urgente';
  productoMonto: string | null;
  productoEstado: 'sin_costo' | 'pendiente_cobro' | 'cobrado';
  productAmountMxn: number | null;
  productPaymentMode: 'sin_cobro' | 'prepago' | 'digital_previo' | 'cod';
  productCollectionStatus: 'no_aplica' | 'pendiente' | 'cobrado';
  settlementStatus: 'no_aplica' | 'pendiente' | 'completado';
  status: OrderStatus;
  deliveryEvidenceUrl: string | null;
  deliveryReceiverName: string | null;
  deliveryReceiverPhone: string | null;
  deliveryReceiverRelation: 'cliente' | 'familiar' | 'vecino' | 'otro' | null;
  deliveryNotes: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentsResponse {
  data: CustomerShipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TransactionType =
  | 'topup'
  | 'service_charge'
  | 'acceptance_fee'
  | 'delivery_earning'
  | 'refund';

export interface WalletTransaction {
  id: number;
  userId: string;
  tipo: TransactionType;
  monto: number;
  orderId: number | null;
  createdAt: string;
}

export interface WalletBalanceResponse {
  balance: number;
}

export interface WalletTopupResponse {
  balance: number;
  topup: {
    id: number;
    userId: string;
    packageCredits: number;
    amountMxn: number;
    provider: string;
    providerTransactionId: string;
    createdAt: string;
  } | null;
  transaction: WalletTransaction | null;
}

export interface WalletTopupRequest {
  packageCredits: 100 | 200 | 500;
  provider?: 'stripe' | 'paypal' | 'mock';
  providerTransactionId?: string;
}

export interface WalletTransactionsResponse {
  data: WalletTransaction[];
}