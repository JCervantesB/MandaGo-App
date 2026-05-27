import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';

export interface CustomerProfile {
  street: string;
  streetNumber: string | null;
  postalCode: string;
  colony: string;
  city: string;
  state: string;
  rfc: string | null;
  businessName: string | null;
}

export interface DriverProfile {
  street: string;
  streetNumber: string | null;
  postalCode: string;
  colony: string;
  city: string;
  state: string;
  vehicleType: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'cliente' | 'repartidor' | 'admin';
  status: string;
  createdAt: string;
  customerProfile: CustomerProfile | null;
  driverProfile: DriverProfile | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile | DriverProfile> & { phone?: string }) => Promise<boolean>;
}

// Hook para obtener y actualizar el perfil del usuario
export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el perfil del usuario
  // Utiliza la API para obtener el perfil
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/me`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar perfil');
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  // Función para actualizar el perfil del usuario
  // Utiliza la API para actualizar el perfil
  // Llama a fetchProfile para actualizar el perfil después de la actualización
  const updateProfile = useCallback(async (data: Partial<CustomerProfile | DriverProfile> & { phone?: string }): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar perfil');
      await fetchProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}