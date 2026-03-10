import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';
import { QueryClientProvider } from '@/queries/provider';
import { GarmentsProvider } from '@/context/garment-context';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/state';
import { ShareIntentHandler } from '@/components/share-intent-handler';

const RootContent = () => {
  const { isCompleted } = useOnboarding();

  return (
    <Stack
      screenLayout={({ children }) => <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>}
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackVisible: false,
      }}>
      <Stack.Protected guard={!isCompleted}>
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={isCompleted}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
      <Stack.Screen
        name="image-detail/[id]"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <QueryClientProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <GarmentsProvider>
              <SafeAreaProvider>
                <RootContent />
                <ShareIntentHandler />
                {/* TODO: clothes selection drawer */}
                {/* TODO: modal with image zoom -n */}
              </SafeAreaProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </GarmentsProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
