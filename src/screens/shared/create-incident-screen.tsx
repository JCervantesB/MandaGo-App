import { CreateIncidentForm } from '@/components/shared/CreateIncidentForm';

interface CreateIncidentScreenProps {
  route?: { params?: { orderId?: number } };
  navigation: any;
}

export function CreateIncidentScreen({ route, navigation }: CreateIncidentScreenProps) {
  const orderId = route?.params?.orderId ?? 0;
  return <CreateIncidentForm orderId={orderId} navigation={navigation} />;
}