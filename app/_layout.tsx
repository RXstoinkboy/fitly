import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';
import { QueryClientProvider } from '@/lib/query-provider';
import { GarmentsProvider } from '@/context/garment-context';
import { useGetStatus } from '@/queries/onboarding/get-status';
import { OnboardingStatus } from '@/lib/onboarding/types';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SelectPhotoModal } from '@/components/modals';

const RootContent = () => {
  const { data } = useGetStatus();
  const isOnboarded = data === OnboardingStatus.Completed;

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackVisible: false,
      }}>
      <Stack.Protected guard={!isOnboarded}>
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={isOnboarded}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
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
    <QueryClientProvider>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <GarmentsProvider>
            <SafeAreaProvider>
              <RootContent />
              {/* TODO: clothes selection drawer */}
              {/* TODO: modal with image zoom -n */}
            </SafeAreaProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </GarmentsProvider>
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
