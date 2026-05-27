import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Search, User } from 'lucide-react-native';
import { BottomNavAdmin } from '@/components/admin-components/BottomNavAdmin';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';

interface ChatChannelSummary {
  id: number;
  orderId: number;
  orderPublicId: string;
  customerId: string;
  customerName: string;
  driverId: string;
  driverName: string;
  lastMessage: string | null;
  lastMessageAt: string;
  updatedAt: string;
}

export function AdminChatsScreen({ navigation }: { navigation: any }) {
  const [channels, setChannels] = useState<ChatChannelSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChannels = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat/admin/channels`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setChannels(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching channels:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const filteredChannels = channels.filter((channel) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      channel.customerName.toLowerCase().includes(query) ||
      channel.driverName.toLowerCase().includes(query) ||
      channel.orderPublicId.toLowerCase().includes(query)
    );
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const renderChannelItem = ({ item }: { item: ChatChannelSummary }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('AdminChatConversation', {
          channelId: item.id,
          orderPublicId: item.orderPublicId,
        })
      }
      className="flex-row items-center px-5 py-4 bg-white border-b border-border"
    >
      <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
        <MessageCircle size={20} color={appColors.primary} />
      </View>
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold text-text">Orden {item.orderPublicId}</Text>
          <Text className="text-xs text-text-muted">{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <User size={12} color={appColors.primary} />
          <Text className="text-xs text-text-muted ml-1 mr-3">{item.customerName}</Text>
          <Text className="text-text/40">•</Text>
          <Text className="text-xs text-text-muted ml-3">{item.driverName}</Text>
        </View>
        {item.lastMessage && (
          <Text className="text-sm text-text/70 mt-1 truncate" numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="px-5 pt-3 pb-4 bg-surface border-b border-border">
          <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
            MandaGo
          </Text>
          <Text className="text-2xl font-extrabold text-text mt-1">Conversaciones</Text>

          <View className="flex-row items-center mt-4 bg-background border border-border rounded-xl px-4 py-3">
            <Search size={18} color={appColors.textMuted} />
            <TextInput
              className="flex-1 ml-3 text-sm text-text"
              placeholder="Buscar por cliente, repartidor u orden..."
              placeholderTextColor={appColors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={appColors.primary} />
            <Text className="text-sm text-text/60 mt-3">Cargando conversaciones...</Text>
          </View>
        ) : filteredChannels.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <MessageCircle size={32} color={appColors.primary} />
            </View>
            <Text className="text-base font-semibold text-text text-center">
              {searchQuery ? 'Sin resultados' : 'Sin conversaciones'}
            </Text>
            <Text className="text-sm text-text-muted text-center mt-2">
              {searchQuery
                ? 'No hay chats que coincidan con tu búsqueda.'
                : 'Cuando haya chats activos, aparecerán aquí.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredChannels}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderChannelItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </SafeAreaView>

      <BottomNavAdmin activeScreen="AdminChats" navigation={navigation} />
    </View>
  );
}