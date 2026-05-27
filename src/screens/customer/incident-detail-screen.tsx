import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { API_BASE_URL } from '@/config/api';
import { SharedIncidentDetail, IncidentDetailLoader, IncidentDetailData } from '@/components/shared/SharedIncidentDetail';

interface ClientIncidentDetailScreenProps {
  route?: { params?: { incidentId?: number } };
  navigation: any;
}

export function ClientIncidentDetailScreen({ route, navigation }: ClientIncidentDetailScreenProps) {
  const [incident, setIncident] = useState<IncidentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchIncident = async () => {
    if (!route?.params?.incidentId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${route.params.incidentId}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setIncident(data);
      }
    } catch (err) {
      console.error('Error fetching incident:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [route?.params?.incidentId]);

  const handleOpenChat = async () => {
    if (!incident) return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat/orders/${incident.orderId}/channel`, {
        method: 'POST',
        credentials: 'include',
      });
      const channel = await res.json();
      if (channel?.id) {
        navigation.navigate('ClientChatConversation', {
          channelId: channel.id,
          orderPublicId: `#${incident.orderId}`,
        });
      }
    } catch {
      Alert.alert('Error', 'No se pudo abrir el chat');
    }
  };

  const handleResolveConfirm = async () => {
    if (!incident || !resolutionNote.trim()) return;
    setIsResolving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incident.id}/resolve`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNote: resolutionNote.trim(), orderStatus: 'cancelado' }),
      });
      if (res.ok) {
        setShowResolveModal(false);
        setResolutionNote('');
        fetchIncident();
      } else {
        Alert.alert('Error', 'No se pudo cerrar la incidencia');
      }
    } catch {
      Alert.alert('Error', 'No se pudo cerrar la incidencia');
    } finally {
      setIsResolving(false);
    }
  };

  const handleNavigateToOrder = () => {
    if (!incident) return;
    navigation.navigate('ClientShipmentDetail', { shipmentId: incident.orderId });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-3 pb-4 bg-surface border-b border-border">
        <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">MandaGo</Text>
        <Text className="text-2xl font-extrabold text-text mt-1">Mi incidencia</Text>
      </View>

      <IncidentDetailLoader isLoading={isLoading} incident={incident}>
        {(incidentData) => (
          <ScrollView className="flex-1 p-4">
            <SharedIncidentDetail incident={incidentData} onResolve={() => setShowResolveModal(true)} onOrderPress={handleNavigateToOrder} />

            {incidentData.status !== 'resuelta' && (
              <View className="mt-4">
                <Pressable
                  onPress={handleOpenChat}
                  className="bg-primary rounded-xl p-4 flex-row items-center justify-center"
                >
                  <MessageCircle size={20} color="white" />
                  <Text className="text-base font-bold text-white ml-2">Abrir chat con repartidor</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}
      </IncidentDetailLoader>

      <Modal visible={showResolveModal} transparent animationType="fade" onRequestClose={() => setShowResolveModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar incidencia</Text>
            <Text style={styles.modalSubtitle}>Ingresa una nota de resolución:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nota de resolución..."
              placeholderTextColor="#9CA3AF"
              value={resolutionNote}
              onChangeText={setResolutionNote}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => { setShowResolveModal(false); setResolutionNote(''); }}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.confirmButton, !resolutionNote.trim() && styles.confirmButtonDisabled]} onPress={handleResolveConfirm} disabled={!resolutionNote.trim() || isResolving}>
                <Text style={styles.confirmButtonText}>{isResolving ? 'Cerrando...' : 'Cerrar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827', textAlignVertical: 'top', minHeight: 100 },
  modalButtons: { flexDirection: 'row', marginTop: 16, gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  confirmButton: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#16A34A', alignItems: 'center' },
  confirmButtonDisabled: { backgroundColor: '#9CA3AF' },
  confirmButtonText: { fontSize: 14, fontWeight: '600', color: 'white' },
});