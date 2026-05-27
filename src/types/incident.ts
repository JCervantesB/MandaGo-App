import { incidentCatalog, incidentStatusLabels, incidentStatusColors } from '@/data/incident-catalog';

export { incidentCatalog, incidentStatusLabels, incidentStatusColors };
export type { IncidentCode } from '@/data/incident-catalog';

export interface IncidentImage {
  id: number;
  imageUrl: string;
  createdAt: string;
}

export interface Incident {
  id: number;
  orderId: number;
  orderPublicId?: string;
  code: string;
  title: string;
  description: string;
  status: 'abierta' | 'en_proceso' | 'resuelta';
  createdByUserId: string;
  creatorName: string | null;
  creatorEmail?: string | null;
  resolvedByUserId?: string | null;
  resolutionNote?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  images?: IncidentImage[];
}

export interface IncidentListItem {
  id: number;
  orderId: number;
  orderPublicId?: string;
  code: string;
  title: string;
  description: string;
  status: 'abierta' | 'en_proceso' | 'resuelta';
  createdByUserId: string;
  creatorName: string | null;
  createdAt: string;
  updatedAt: string;
}