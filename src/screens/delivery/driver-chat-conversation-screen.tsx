import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react-native';
import { useChatMessages } from '@/hooks/use-chat';
import { appColors } from '@/theme/theme';
import type { ChatMessage } from '@/hooks/use-chat';

interface DriverChatConversationScreenProps {
  route: { params: { channelId: number; orderPublicId: string; customerName?: string } };
  navigation: any;
}

export function DriverChatConversationScreen({ route, navigation }: DriverChatConversationScreenProps) {
  const { channelId, orderPublicId, customerName } = route.params;
  const { messages, isLoading, sendMessage } = useChatMessages(channelId);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(inputText.trim());
      setInputText('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.senderId === 'current';
    const showHeader = index === 0 || messages[index - 1].senderId !== item.senderId;

    return (
      <View className={`flex-row ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4`}>
        {!isOwn && showHeader && (
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2 mt-1">
            <Text className="text-xs text-primary font-semibold">C</Text>
          </View>
        )}
        {!isOwn && !showHeader && <View className="w-8 mr-2" />}
        <View
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isOwn
              ? 'bg-primary rounded-br-md'
              : 'bg-white border border-border rounded-bl-md'
          }`}
        >
          <Text className={`text-sm leading-5 ${isOwn ? 'text-white' : 'text-text'}`}>
            {item.content}
          </Text>
          <Text className={`text-xs mt-1.5 ${isOwn ? 'text-white/60' : 'text-text-muted'}`}>
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
            <View className="flex-row items-center mt-0.5">
              <View className="w-2 h-2 rounded-full bg-green-300" />
              <Text className="text-xs text-white/80 ml-1.5">Chat con {customerName || 'el cliente'}</Text>
            </View>
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
          <Text className="text-base font-semibold text-text text-center">Sin mensajes aún</Text>
          <Text className="text-sm text-text-muted text-center mt-2">
            Inicia la conversación con el cliente. Puedes preguntar sobre la dirección, detalles del paquete o cualquier otra cosa.
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View className="flex-row items-end px-4 py-3 bg-surface border-t border-border">
          <TextInput
            className="flex-1 bg-white rounded-2xl px-4 py-3 text-sm text-text max-h-24 border border-border"
            placeholder="Escribe un mensaje..."
            placeholderTextColor={appColors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            className={`w-12 h-12 rounded-full items-center justify-center ml-3 ${
              inputText.trim() && !isSending ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}