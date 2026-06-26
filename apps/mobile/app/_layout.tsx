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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useOnboarding } from '@/state';
import { SubscriptionProvider } from '@/components/subscription';
import { AnalyticsProvider } from '@/lib/analytics';
import { DevMenu } from '@/components/dev-menu';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';

const RootContent = () => {
  const { isCompleted } = useOnboarding();

  return (
    <Stack
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
        <Stack.Screen
          name="models-gallery"
          options={{
            title: 'Model gallery',
          }}
        />
        <Stack.Screen
          name="model-detail/[id]"
          options={{
            presentation: 'modal',
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
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AnalyticsProvider>
        <TamaguiProvider
          config={tamaguiConfig}
          defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
          <QueryClientProvider>
            <SubscriptionProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <GarmentsProvider>
                  <SafeAreaProvider>
                    <RootContent />
                    <DevMenu />
                    {/* TODO: clothes selection drawer */}
                    {/* TODO: modal with image zoom -n */}
                  </SafeAreaProvider>
                  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                </GarmentsProvider>
              </ThemeProvider>
            </SubscriptionProvider>
          </QueryClientProvider>
        </TamaguiProvider>
      </AnalyticsProvider>
    </GestureHandlerRootView>
  );
}
