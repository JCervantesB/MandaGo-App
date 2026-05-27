export type UserStatus = 'active' | 'pending' | 'disabled';

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
}

export interface Client extends UserListItem {
  status: 'pending_onboarding' | 'active' | 'disabled';
}

export interface Driver extends UserListItem {
  status: 'pending_onboarding' | 'active' | 'disabled';
  vehicleType?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type ClientStatusFilter = 'pending_onboarding' | 'active' | 'disabled';
export type DriverStatusFilter = 'pending_onboarding' | 'active' | 'disabled';