/**
 * Tipos de navegación para MandaGo.
 * Define las rutas disponibles para cada tipo de usuario.
 * Utiliza React Navigation para el sistema de navegación nativa.
 */

/** Roles de usuario en la aplicación */
export type UserRole = 'cliente' | 'repartidor' | 'admin';

/** Navegación pública (sin sesión) */
export type PublicStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: { role?: UserRole } | undefined;
};

/** Navegación del admin */
export type AdminStackParamList = {
  AdminHome: undefined;
  ManageUsers: undefined;
  ManageOrders: undefined;
  Incidents: undefined;
  Reports: undefined;
  OrdersAdmin: undefined;
  DriversAdmin: undefined;
  CustomersAdmin: undefined;
  IncidentsAdmin: undefined;
  CreditsAdmin: undefined;
  SettlementsAdmin: undefined;
  ConfigFinanceAdmin: undefined;
  ReportsAdmin: undefined;
  ClientDetailAdmin: { userId: string };
  DriverDetailAdmin: { userId: string };
  AdminOrderDetail: { orderId: number };
  AdminSettings: undefined;
  IncidentDetail: { incidentId: number };
  CreateIncident: { orderId: number };
  AdminChats: undefined;
  AdminChatConversation: { channelId: number; orderPublicId: string };
};

/** Navegación del cliente */
export type ClientStackParamList = {
  ClientHome: undefined;
  Onboarding: undefined;
  ClientShipments: undefined;
  ClientCreateShipment: undefined;
  ClientShipmentsList: undefined;
  ClientShipmentDetail: { shipmentId: number };
  ClientChats: undefined;
  ClientChatConversation: { channelId: number; orderPublicId: string };
  ClientWallet: undefined;
  ClientSettings: undefined;
  ClientIncidents: undefined;
  ClientIncidentDetail: { incidentId: number };
  CreateIncident: { orderId: number };
};

/** Navegación del repartidor */
export type DeliveryStackParamList = {
  DeliveryHome: undefined;
  DeliveryAvailableOrders: undefined;
  DeliveryOrderFlow: { orderId?: number };
  DeliveryOrdersList: undefined;
  DeliveryWallet: undefined;
  DeliveryChatConversation: { channelId: number; orderPublicId: string; customerName?: string };
  DriverIncidents: undefined;
  DriverIncidentDetail: { incidentId: number };
};

/** Navegación compartida */
export type SharedStackParamList = {
  Settings: undefined;
};

/** Navegación raíz */
export type RootNavParamList = {
  Home: undefined;
  Onboarding: undefined;
};

/** Unión de todos los tipos de navegación */
export type RootStackParamList = PublicStackParamList & AdminStackParamList & ClientStackParamList & DeliveryStackParamList & SharedStackParamList & RootNavParamList;