import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';

interface ChatMessage {
  id: number;
  channelId: number;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChannelInfo {
  id: number;
  orderId: number;
  orderPublicId: string;
  customerId: string;
  customerName: string;
  driverId: string;
  driverName: string;
}

interface AdminChatConversationScreenProps {
  route: { params: { channelId: number; orderPublicId: string } };
  navigation: any;
}

export function AdminChatConversationScreen({ route, navigation }: AdminChatConversationScreenProps) {
  const { channelId, orderPublicId } = route.params;
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [channelRes, messagesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/chat/admin/channels/${channelId}`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/chat/admin/channels/${channelId}/messages`, { credentials: 'include' }),
      ]);

      if (channelRes.ok) {
        const channelData = await channelRes.json();
        setChannel(channelData);
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages ?? []);
      }
    } catch (err) {
      console.error('Error fetching chat data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = new WebSocket(`ws://${process.env.EXPO_PUBLIC_API_URL?.replace('http://', '')}/socket.io?transport=websocket`);

    return () => {
      socket.close();
    };
  }, [channelId]);

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isCustomer = item.senderId === channel?.customerId;
    const showHeader = index === 0 || messages[index - 1].senderId !== item.senderId;

    return (
      <View className={`flex-row ${isCustomer ? 'justify-start' : 'justify-end'} mb-1 px-4`}>
        {isCustomer && showHeader && (
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2 mt-1">
            <Text className="text-xs text-primary font-semibold">C</Text>
          </View>
        )}
        {!isCustomer && showHeader && (
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2 mt-1">
            <Text className="text-xs text-white font-semibold">R</Text>
          </View>
        )}
        {!isCustomer && !showHeader && <View className="w-8 mr-2" />}
        {isCustomer && !showHeader && <View className="w-8 mr-2" />}
        <View
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isCustomer ? 'bg-white border border-border rounded-bl-md' : 'bg-primary rounded-br-md'
          }`}
        >
          <Text className={`text-sm leading-5 ${isCustomer ? 'text-text' : 'text-white'}`}>
            {item.content}
          </Text>
          <Text className={`text-xs mt-1.5 ${isCustomer ? 'text-text-muted' : 'text-white/60'}`}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="bg-primary" edges={['top']}>
        <View className="flex-row items-center px-4 py-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </Pressable>
          <View className="flex-1 ml-3">
            <Text className="text-lg font-bold text-white">Orden {orderPublicId}</Text>
            {channel && (
              <View className="flex-row items-center mt-0.5">
                <View className="w-2 h-2 rounded-full bg-green-300" />
                <Text className="text-xs text-white/80 ml-1.5">
                  {channel.customerName} → {channel.driverName}
                </Text>
              </View>
            )}
          </View>
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <MessageCircle size={20} color="white" />
          </View>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
          <Text className="text-sm text-text-muted mt-3">Cargando conversación...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
            <MessageCircle size={32} color={appColors.primary} />
          </View>
          <Text className="text-base font-semibold text-text text-center">Sin mensajes</Text>
          <Text className="text-sm text-text-muted text-center mt-2">
            Esta conversación aún no tiene mensajes.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View className="px-4 py-3 bg-surface border-t border-border items-center justify-center">
        <Text className="text-xs text-text-muted">Solo lectura para el administrador</Text>
      </View>
    </View>
  );
}