export const incidentCatalog = [
  { code: 'INC-001', title: 'Dirección inválida', description: 'No se encontró la dirección' },
  { code: 'INC-002', title: 'Cliente no disponible', description: 'No se localizó al destinatario' },
  { code: 'INC-003', title: 'Paquete dañado', description: 'El producto llegó dañado' },
  { code: 'INC-004', title: 'Paquete no coincide', description: 'El contenido no es lo solicitado' },
  { code: 'INC-005', title: 'Rechazo del cliente', description: 'El destinatario rechaza el paquete' },
  { code: 'INC-006', title: 'Pedido extraviado', description: 'El paquete no apareció' },
  { code: 'INC-007', title: 'Accidente', description: 'Incidente con el repartidor' },
  { code: 'INC-008', title: 'Vehículo falla', description: 'Problema mecánico' },
  { code: 'INC-009', title: 'Clima adverso', description: 'Clima adverso' },
  { code: 'INC-010', title: 'Otro', description: 'Otra incidencia' },
] as const;

export type IncidentCode = (typeof incidentCatalog)[number]['code'];

export const incidentStatusLabels: Record<string, string> = {
  abierta: 'Abierta',
  en_proceso: 'En proceso',
  resuelta: 'Resuelta',
};

export const incidentStatusColors: Record<string, string> = {
  abierta: '#DC2626',
  en_proceso: '#F59E0B',
  resuelta: '#16A34A',
};