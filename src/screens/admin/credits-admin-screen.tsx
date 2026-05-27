import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, CreditCard } from 'lucide-react-native';
import { BottomNavAdmin } from '@/components/admin-components/BottomNavAdmin';
import { CreditTransactionCard } from '@/components/admin-components/CreditTransactionCard';
import { useAdminTransactions } from '@/hooks/use-admin-transactions';
import { appColors } from '@/theme/theme';

interface CreditsAdminScreenProps {
  navigation: any;
}

export function CreditsAdminScreen({ navigation }: CreditsAdminScreenProps) {
  const { transactions, isLoading, pagination, search, setSearch, fetchPage } = useAdminTransactions();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="px-5 pt-3 pb-4 bg-surface border-b border-border">
          <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
            MandaGo
          </Text>
          <Text className="text-2xl font-extrabold text-text mt-1">Créditos y movimientos</Text>
        </View>

        <View className="px-5 py-3 bg-surface border-b border-border">
          <View className="flex-row items-center bg-white border border-border rounded-xl px-3 py-2">
            <Search size={18} color={appColors.textMuted} className="mr-2" />
            <TextInput
              className="flex-1 text-sm text-text"
              placeholder="Buscar por nombre o email..."
              placeholderTextColor={appColors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} className="ml-2">
                <Text className="text-xs text-text/60">✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {isLoading && transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={appColors.primary} />
            <Text className="text-sm text-text/60 mt-3">Cargando transacciones...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center px-5">
            <CreditCard size={40} color="#9CA3AF" className="mb-3" />
            <Text className="text-base font-semibold text-text mb-1">
              {search ? 'Sin resultados' : 'Sin movimientos'}
            </Text>
            <Text className="text-sm text-text/60 text-center">
              {search ? 'No hay transacciones que coincidan con tu búsqueda.' : 'Aún no hay transacciones registradas.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
            renderItem={({ item }) => <CreditTransactionCard transaction={item} />}
            ListFooterComponent={
              pagination.totalPages > 1 ? (
                <View className="flex-row justify-center items-center gap-3 pt-4 pb-4">
                  <Pressable
                    onPress={() => fetchPage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1 || isLoading}
                    className={`py-2 px-4 rounded-xl ${pagination.currentPage > 1 ? 'bg-primary' : 'bg-border'}`}
                  >
                    <Text className={`text-sm font-semibold ${pagination.currentPage > 1 ? 'text-white' : 'text-text/50'}`}>
                      Anterior
                    </Text>
                  </Pressable>
                  <Text className="text-sm text-text font-medium">
                    {pagination.currentPage} / {pagination.totalPages}
                  </Text>
                  <Pressable
                    onPress={() => fetchPage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                    className={`py-2 px-4 rounded-xl ${pagination.currentPage < pagination.totalPages ? 'bg-primary' : 'bg-border'}`}
                  >
                    <Text className={`text-sm font-semibold ${pagination.currentPage < pagination.totalPages ? 'text-white' : 'text-text/50'}`}>
                      Siguiente
                    </Text>
                  </Pressable>
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>

      <BottomNavAdmin activeScreen="CreditsAdmin" navigation={navigation} />
    </View>
  );
}