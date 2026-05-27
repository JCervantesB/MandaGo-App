import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { BottomNavCustomer } from '@/components/customer-components/BottomNavCustomer';
import { useChatChannels } from '@/hooks/use-chat';
import { appColors } from '@/theme/theme';
import type { ChatChannel } from '@/hooks/use-chat';

interface ChatsCustomerScreenProps {
  navigation: any;
}

export function ChatsCustomerScreen({ navigation }: ChatsCustomerScreenProps) {
  const { channels, isLoading, refetch } = useChatChannels();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  const renderChannelItem = ({ item }: { item: ChatChannel }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('ClientChatConversation', {
          channelId: item.id,
          orderPublicId: `#${item.orderId}`,
        })
      }
      className="flex-row items-center px-5 py-4 bg-white border-b border-border"
    >
      <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
        <MessageCircle size={20} color="white" />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-text">Orden #{item.orderId}</Text>
        <Text className="text-sm text-text-muted mt-0.5">
          Toca para abrir la conversación
        </Text>
      </View>
      <View className="w-2 h-2 rounded-full bg-primary" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="bg-primary" edges={['top']}>
        <View className="flex-row items-center px-4 py-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </Pressable>
          <View className="flex-1 ml-3">
            <Text className="text-xl font-bold text-white mt-0.5">Mis Chats</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <MessageCircle size={20} color="white" />
          </View>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
          <Text className="text-sm text-text-muted mt-3">Cargando conversaciones...</Text>
        </View>
      ) : channels.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
            <MessageCircle size={32} color={appColors.primary} />
          </View>
          <Text className="text-base font-semibold text-text text-center">Sin conversaciones</Text>
          <Text className="text-sm text-text-muted text-center mt-2">
            Cuando un repartidor acepte tu pedido, podrás chatear con él aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderChannelItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      <BottomNavCustomer activeScreen="ClientChats" navigation={navigation} />
    </View>
  );
}