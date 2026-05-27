import 'react-native-gesture-handler';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { RootNavigator } from '@/navigation/root-navigator';
import { SessionProvider } from '@/auth/session-provider';
import { AppQueryProvider } from '@/query/query-provider';
import { AppStateProvider, GlobalDriverLocationReporter } from '@/state/app-state';
import { appColors, navigationTheme } from '@/theme/theme';
import { useNotificationHandler, requestNotificationPermissions } from '@/hooks/use-notification-handler';

function NotificationHandler() {
  useNotificationHandler();
  return null;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppQueryProvider>
          <AppStateProvider>
            <GlobalDriverLocationReporter>
              <SessionProvider>
                <NavigationContainer theme={navigationTheme}>
                  <NotificationHandler />
                  <RootNavigator />
                </NavigationContainer>
              </SessionProvider>
            </GlobalDriverLocationReporter>
          </AppStateProvider>
        </AppQueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
});