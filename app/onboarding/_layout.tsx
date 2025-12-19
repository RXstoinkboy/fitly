import { Back, Next } from '@/components/onboarding/navigation';
import { XStack } from '@/components/v2/ui';
import { HEADER_HEIGHT } from '@/constants/dimensions';
import { OnboardingStatus } from '@/lib/onboarding/types';
import { useUpdateStatus } from '@/queries/onboarding/update-status';
import { Stack } from 'expo-router';
import { StyleProp } from 'react-native';

export default function OnboardingLayout() {
  const updateStatus = useUpdateStatus();

  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerBackVisible: false,
        headerStyle: {
          height: HEADER_HEIGHT,
        } as StyleProp<{ backgroundColor?: string; height?: number }>,
        headerBackground: () => <XStack />,
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
