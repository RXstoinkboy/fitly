import { Back, Next } from '@/components/onboarding/navigation';
import { XStack } from '@/components/v2/ui';
import { OnboardingStatus } from '@/lib/onboarding/types';
import { useUpdateStatus } from '@/queries/onboarding/update-status';
import { Stack } from 'expo-router';
import { getTokens } from 'tamagui';

export default function OnboardingLayout() {
  const updateStatus = useUpdateStatus();

  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerBackVisible: false,
        headerBackground: () => <XStack />,
        contentStyle: {
          padding: getTokens().space['$4'].val,
          //   backgroundColor: theme.color2.val,
        },
      }}>
      <Stack.Screen
        name="welcome"
        options={{
          headerRight: () => <Next href={'/onboarding/select-user-photo'} />,
        }}
      />
      <Stack.Screen
        name="select-user-photo"
        options={{
          headerRight: () => <Next href={'/onboarding/select-garments'} />,
          headerLeft: () => <Back href={'/onboarding/welcome'} />,
        }}
      />
      <Stack.Screen name="user-photo-selected" />
      <Stack.Screen
        name="select-garments"
        options={{
          headerRight: () => <Next href={'/onboarding/finish'} />,
          headerLeft: () => <Back href={'/onboarding/select-user-photo'} />,
        }}
      />
      <Stack.Screen
        name="finish"
        options={{
          headerRight: () => (
            <Next href={'/(tabs)'} onPress={() => updateStatus.mutate(OnboardingStatus.Completed)}>
              Done!
            </Next>
          ),
          headerLeft: () => <Back href={'/onboarding/select-garments'} />,
        }}
      />
    </Stack>
  );
}
