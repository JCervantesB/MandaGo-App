import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import { incidentCatalog } from '@/data/incident-catalog';
import type { Incident, IncidentListItem } from '@/types/incident';

interface UseIncidentsReturn {
  incidents: IncidentListItem[];
  isLoading: boolean;
  fetchIncidents: (filters?: { status?: string }) => void;
}

// Hook para obtener lista de incidencias con filtros
export function useIncidents(): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncidents = useCallback(async (filters?: { status?: string }) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/incidents`;
      if (filters?.status) url += `?status=${filters.status}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar incidencias');
      const data = await response.json();
      setIncidents(data ?? []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return { incidents, isLoading, fetchIncidents };
}

interface UseIncidentDetailReturn {
  incident: Incident | null;
  isLoading: boolean;
  refresh: () => void;
}

// Hook para obtener detalle de una incidencia por ID
export function useIncidentDetail(incidentId?: number): UseIncidentDetailReturn {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!incidentId) {
      setIncident(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar incidencia');
      const data = await response.json();
      console.log('[useIncidentDetail] Response data:', JSON.stringify(data).substring(0, 500));
      setIncident(data);
    } catch (err) {
      console.error('Error fetching incident detail:', err);
      setIncident(null);
    } finally {
      setIsLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { incident, isLoading, refresh };
}

export function getIncidentCatalogItem(code: string) {
  return incidentCatalog.find((i) => i.code === code);
}