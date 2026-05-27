import { API_BASE_URL } from '../config/api';
import type { Client, Driver, PaginatedResponse, ClientStatusFilter, DriverStatusFilter } from '../types/admin.types';

/**
 * Datos completos de un cliente para la ficha administrativa.
 */
export interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerProfile?: {
    street: string | null;
    streetNumber: string | null;
    postalCode: string | null;
    colony: string | null;
    city: string | null;
    state: string | null;
    rfc: string | null;
    businessName: string | null;
  } | null;
  driverProfile?: {
    street: string | null;
    streetNumber: string | null;
    postalCode: string | null;
    colony: string | null;
    city: string | null;
    state: string | null;
    vehicleType: string | null;
    ineUrl: string | null;
    driverLicenseUrl: string | null;
    vehiclePhotoUrl: string | null;
  } | null;
}

/**
 * Obtiene los detalles completos de un cliente desde la API.
 * 
 * @param userId - Identificador único del usuario
 * @returns Objeto con datos completos del cliente o null si no se encuentra
 * @throws Error si la solicitud falla
 */
export async function getClientDetails(userId: string): Promise<ClientDetails | null> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/details`, {
    credentials: 'include',
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Actualiza el estado de un usuario (activo/deshabilitado).
 * 
 * @param userId - Identificador único del usuario a actualizar
 * @param status - Nuevo estado del usuario ('activo' o 'deshabilitado')
 * @returns true si la actualización fue exitosa, false en caso contrario
 * @throws Error si la solicitud falla
 */
export async function updateUserStatus(
  userId: string,
  status: 'activo' | 'deshabilitado',
): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  return res.ok;
}

/**
 * Rechaza un usuario con un motivo.
 * 
 * @param userId - Identificador único del usuario a rechazar
 * @param reason - Motivo del rechazo
 * @returns true si la operación fue exitosa, false en caso contrario
 */
export async function rejectUser(
  userId: string,
  reason: string,
): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason }),
  });

  return res.ok;
}

// Obtiene clientes filtrados por estado con paginación
export async function fetchClientsByStatus(
  status: ClientStatusFilter,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Client>> {
  const statusEndpoints: Record<ClientStatusFilter, string> = {
    pending_onboarding: '/users/pending-onboarding/paginated',
    active: '/users/active/paginated',
    disabled: '/users/disabled/paginated',
  };

  const response = await fetch(
    `${API_BASE_URL}${statusEndpoints[status]}?page=${page}&limit=${limit}`,
    { credentials: 'include' },
  );

  if (!response.ok) {
    throw new Error('Error al cargar clientes');
  }

  return response.json();
}

// Obtiene repartidores filtrados por estado con paginación
export async function fetchDriversByStatus(
  status: DriverStatusFilter,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Driver>> {
  const statusEndpoints: Record<DriverStatusFilter, string> = {
    pending_onboarding: '/users/pending-onboarding/paginated?role=repartidor',
    active: '/users/active/paginated?role=repartidor',
    disabled: '/users/disabled/paginated?role=repartidor',
  };

  const response = await fetch(
    `${API_BASE_URL}${statusEndpoints[status]}&page=${page}&limit=${limit}`,
    { credentials: 'include' },
  );

  if (!response.ok) {
    throw new Error('Error al cargar repartidores');
  }

  return response.json();
}