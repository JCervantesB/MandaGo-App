export type OrderPriority = 'normal' | 'express' | 'urgente';

export type OrderStatus =
  | 'creado'
  | 'disponible'
  | 'asignado'
  | 'aceptado'
  | 'en_recorrido'
  | 'recogido'
  | 'en_entrega'
  | 'entregado'
  | 'incidencia'
  | 'cancelado';

export interface DeliveryOrder {
  id: number;
  publicId: string;
  status: OrderStatus;
  priority: OrderPriority;
  packageDescription: string;
  packageSize: string;
  destName: string;
  destPhone: string;
  destAddress: string;
  originAddress: string;
  originLat: string;
  originLng: string;
  destLat: string;
  destLng: string;
  serviceFee: number;
  driverEarning: number;
  createdAt: string;
  updatedAt: string;
}

export const PRIORITY_CONFIG: Record<OrderPriority, { label: string; color: string; bgColor: string }> = {
  normal: { label: 'Normal', color: '#2563EB', bgColor: '#DBEAFE' },
  express: { label: 'Express', color: '#D97706', bgColor: '#FEF3C7' },
  urgente: { label: 'Urgente', color: '#DC2626', bgColor: '#FEE2E2' },
};

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; nextAction?: string }> = {
  creado: { label: 'Creado', color: '#3B82F6' },
  disponible: { label: 'Disponible', color: '#8B5CF6' },
  asignado: { label: 'Asignado', color: '#8B5CF6' },
  aceptado: { label: 'Aceptado', color: '#F59E0B' },
  en_recorrido: { label: 'En recorrido', color: '#F59E0B' },
  recogido: { label: 'Recogido', color: '#F59E0B' },
  en_entrega: { label: 'En entrega', color: '#F59E0B' },
  entregado: { label: 'Entregado', color: '#16A34A' },
  incidencia: { label: 'Incidencia', color: '#DC2626' },
  cancelado: { label: 'Cancelado', color: '#6B7280' },
};