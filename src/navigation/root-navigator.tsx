/**
 * Navigator principal de la aplicación.
 * Maneja la navegación según el estado de sesión y el rol del usuario.
 *
 * Flujo:
 * - Sin sesión: muestra pantallas públicas (Landing, Login, Register)
 * - Admin: muestra pantalla de Admin directamente
 * - Cliente/Repartidor sin perfil completo: muestra Onboarding
 * - Cliente/Repartidor con perfil completo: muestra Home según rol
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminHomeScreen } from '../screens/admin/home-admin-screen';
import { OrdersAdminScreen } from '../screens/admin/orders-admin-screen';
import { DriversAdminScreen } from '../screens/admin/drivers-admin-screen';
import { CustomersAdminScreen } from '../screens/admin/customers-admin-screen';
import { IncidentsAdminScreen } from '../screens/admin/incidents-admin-screen';
import { CreditsAdminScreen } from '../screens/admin/credits-admin-screen';
import { ConfigFinanceAdminScreen } from '../screens/admin/config-finance-admin-screen';
import { ClientDetailAdminScreen } from '../screens/admin/client-detail-admin-screen';
import { DriverDetailAdminScreen } from '../screens/admin/driver-detail-admin-screen';
import { AdminSettingsScreen } from '../screens/admin/admin-settings-screen';
import { IncidentDetailScreen as AdminIncidentDetailScreen } from '../screens/shared/incident-detail-screen';
import { CreateIncidentScreen } from '../screens/shared/create-incident-screen';
import { AdminOrderDetailScreen } from '../screens/admin/admin-order-detail-screen';
import { AdminChatsScreen } from '../screens/admin/admin-chats-screen';
import { AdminChatConversationScreen } from '../screens/admin/admin-chat-conversation-screen';
import { CustomerHomeScreen } from '../screens/customer/home-customer-screen';
import { DeliveryHomeScreen } from '../screens/delivery/delivery-home-screen';
import { AvailableOrdersScreen } from '../screens/delivery/available-orders-screen';
import { CreateShipmentScreen } from '../screens/customer/create-shipment-screen';
import { ShipmentDetailScreen } from '../screens/customer/shipment-detail-screen';
import { ShipmentsListScreen } from '../screens/customer/shipments-list-screen';
import { ChatsCustomerScreen } from '../screens/customer/chats-customer-screen';
import { ClientChatConversationScreen } from '../screens/customer/chat-conversation-screen';
import { MoreCustomerScreen } from '../screens/customer/more-customer-screen';
import { IncidentListScreen } from '../screens/customer/incident-list-screen';
import { ClientIncidentDetailScreen } from '../screens/customer/incident-detail-screen';
import { DriverIncidentListScreen } from '../screens/delivery/driver-incident-list-screen';
import { DriverIncidentDetailScreen as DriverIncidentDetailScreenComponent } from '../screens/delivery/driver-incident-detail-screen';
import { DeliveryOrderFlowScreen } from '../screens/delivery/delivery-order-flow-screen';
import { DriverChatConversationScreen } from '../screens/delivery/driver-chat-conversation-screen';
import { LandingScreen } from '../screens/public/landing-screen';
import { LoginScreen } from '../screens/public/login-screen';
import { OnboardingScreen } from '../screens/shared/onboarding-screen';
import { RegisterScreen } from '../screens/public/register-screen';
import { SettingsScreen } from '../screens/shared/settings-screen';
import { WalletScreen } from '../screens/shared/wallet-screen';
import { BottomNavDelivery } from '../components/delivery-components/BottomNavDelivery';
import { BottomNavCustomer } from '../components/customer-components/BottomNavCustomer';
import { useSession } from '../auth/session-provider';
import type { SessionState } from '../auth/session-provider';
import { appColors } from '../theme/theme';
import type { RootStackParamList } from './types';

export { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

function getInitialRoute(
  session: SessionState['session'],
  onboardingStatus: SessionState['onboardingStatus'],
): keyof RootStackParamList {
  if (!session) return 'Landing';

  const userRole = session.user?.role;

  if (userRole === 'admin') return 'AdminHome';

  if (userRole === 'cliente' || userRole === 'repartidor') {
    if (onboardingStatus?.profileCompleted) {
      if (userRole === 'cliente') return 'ClientHome';
      if (userRole === 'repartidor') return 'DeliveryHome';
    }
    return 'Onboarding';
  }

  return 'Landing';
}

export function RootNavigator() {
  const { session, onboardingStatus } = useSession();

  const initialRoute = getInitialRoute(session, onboardingStatus);
  const userRole = session?.user?.role;
  const profileCompleted = onboardingStatus?.profileCompleted;

  const isAdmin = userRole === 'admin';
  const isClientOrDelivery = userRole === 'cliente' || userRole === 'repartidor';
  const showOnboarding = isClientOrDelivery && !profileCompleted;

  return (
    <Stack.Navigator
      id="RootNavigator"
      key={`${session ? 'auth' : 'guest'}-${session?.user?.role ?? 'none'}-${onboardingStatus?.status ?? 'unknown'}`}
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: appColors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { color: '#FFFFFF' },
        contentStyle: { backgroundColor: appColors.background },
        animation: 'none',
        animationDuration: 0,
      }}
    >
      {/* Sin sesión: pantallas públicas */}
      {!session && (
        <>
          <Stack.Screen
            name="Landing"
            component={LandingScreen}
            options={{ title: 'MandaGo', headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Iniciar sesión' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Registro' }}
          />
        </>
      )}

      {/* Admin */}
      {session && isAdmin && (
        <>
          <Stack.Screen
            name="AdminHome"
            component={AdminHomeScreen}
            options={{ title: 'Admin MandaGo' }}
          />
          <Stack.Screen name="OrdersAdmin" component={OrdersAdminScreen} options={{ title: 'Ordenes activas' }} />
          <Stack.Screen name="DriversAdmin" component={DriversAdminScreen} options={{ title: 'Repartidores' }} />
          <Stack.Screen name="CustomersAdmin" component={CustomersAdminScreen} options={{ title: 'Clientes' }} />
          <Stack.Screen name="IncidentsAdmin" component={IncidentsAdminScreen} options={{ title: 'Incidencias' }} />
          <Stack.Screen name="CreditsAdmin" component={CreditsAdminScreen} options={{ title: 'Créditos y movimientos' }} />
          <Stack.Screen name="ConfigFinanceAdmin" component={ConfigFinanceAdminScreen} options={{ title: 'Configuración financiera' }} />
          <Stack.Screen name="ClientDetailAdmin" component={ClientDetailAdminScreen} options={{ title: 'Detalles del cliente' }} />
          <Stack.Screen name="DriverDetailAdmin" component={DriverDetailAdminScreen} options={{ title: 'Detalles del repartidor' }} />
          <Stack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} options={{ title: 'Detalle de orden' }} />
          <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'Configuración' }} />
          <Stack.Screen name="IncidentDetail" component={AdminIncidentDetailScreen} options={{ title: 'Detalle de incidencia' }} />
          <Stack.Screen name="CreateIncident" component={CreateIncidentScreen} options={{ title: 'Reportar incidencia' }} />
          <Stack.Screen name="AdminChats" component={AdminChatsScreen} options={{ title: 'Conversaciones', headerShown: false }} />
          <Stack.Screen name="AdminChatConversation" component={AdminChatConversationScreen} options={{ title: 'Chat', headerShown: false }} />
        </>
      )}

      {/* Onboarding */}
      {session && showOnboarding && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ title: 'Completar perfil' }}
        />
      )}

      {/* Cliente/Repartidor con perfil completo */}
      {session && isClientOrDelivery && profileCompleted && (
        <>
          <Stack.Screen
            name="ClientHome"
            component={CustomerHomeScreen}
            options={{ title: 'MandaGo', headerShown: false }}
          />
          <Stack.Screen
            name="ClientShipments"
            component={ShipmentsListScreen}
            options={{ title: 'Envíos' }}
          />
          <Stack.Screen
            name="ClientCreateShipment"
            component={CreateShipmentScreen}
            options={{ title: 'Nuevo envío' }}
          />
          <Stack.Screen
            name="ClientShipmentsList"
            component={ShipmentsListScreen}
            options={{ title: 'Mis Envíos' }}
          />
          <Stack.Screen
            name="ClientShipmentDetail"
            component={ShipmentDetailScreen}
            options={{ title: 'Detalle del envío' }}
          />
          <Stack.Screen
            name="ClientChats"
            component={ChatsCustomerScreen}
            options={{ title: 'Chats', headerShown: false }}
          />
          <Stack.Screen
            name="ClientChatConversation"
            component={ClientChatConversationScreen}
            options={{ title: 'Chat', headerShown: false }}
          />
          <Stack.Screen
            name="ClientWallet"
            options={{ title: 'Cartera' }}
          >
            {({ navigation }) => (
              <WalletScreen
                navigation={navigation}
                BottomNavComponent={BottomNavCustomer}
                activeScreen="ClientWallet"
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="ClientSettings"
            component={MoreCustomerScreen}
            options={{ title: 'Más', headerShown: false }}
          />
          <Stack.Screen
            name="ClientIncidents"
            component={IncidentListScreen}
            options={{ title: 'Mis incidencias' }}
          />
          <Stack.Screen
            name="ClientIncidentDetail"
            component={ClientIncidentDetailScreen}
            options={{ title: 'Detalle de incidencia' }}
          />
          <Stack.Screen
            name="DeliveryHome"
            component={DeliveryHomeScreen}
            options={{ title: 'Repartidor MandaGo', headerShown: false }}
          />
          <Stack.Screen
            name="DeliveryAvailableOrders"
            component={AvailableOrdersScreen}
            options={{ title: 'Ordenes disponibles' }}
          />
          <Stack.Screen
            name="DeliveryOrderFlow"
            component={DeliveryOrderFlowScreen}
            options={{ title: 'Pedido', headerShown: false }}
          />
          <Stack.Screen
            name="DeliveryChatConversation"
            component={DriverChatConversationScreen}
            options={{ title: 'Chat', headerShown: false }}
          />
          <Stack.Screen
            name="DeliveryWallet"
            options={{ title: 'Cartera' }}
          >
            {({ navigation }) => (
              <WalletScreen
                navigation={navigation}
                BottomNavComponent={BottomNavDelivery}
                activeScreen="Wallet"
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="DriverIncidents"
            component={DriverIncidentListScreen}
            options={{ title: 'Mis incidencias' }}
          />
          <Stack.Screen
            name="DriverIncidentDetail"
            component={DriverIncidentDetailScreenComponent}
            options={{ title: 'Detalle de incidencia' }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
          <Stack.Screen name="CreateIncident" component={CreateIncidentScreen} options={{ title: 'Reportar incidencia' }} />
        </>
      )}
    </Stack.Navigator>
  );
}