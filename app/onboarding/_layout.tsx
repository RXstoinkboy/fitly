import { Back } from '@/components/onboarding/navigation';
import { Next } from '@/components/onboarding/navigation/next';
import { OnboardingStatus } from '@/lib/onboarding/types';
import { useUpdateStatus } from '@/queries/onboarding/update-status';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  const updateStatus = useUpdateStatus();

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackVisible: false,
      }}>
      <Stack.Screen
        name="welcome"
        options={{
          title: 'Welcome!',
          headerRight: () => <Next href={'/onboarding/select-user-photo'} />,
        }}
      />
      <Stack.Screen
        name="select-user-photo"
        options={{
          title: 'Prepare photo',
          headerRight: () => <Next href={'/onboarding/select-garments'} />,
          headerLeft: () => <Back href={'/onboarding/welcome'} />,
        }}
      />
      <Stack.Screen
        name="select-garments"
        options={{
          title: 'Photo is ready',
          headerRight: () => <Next href={'/onboarding/finish'} />,
          headerLeft: () => <Back href={'/onboarding/select-user-photo'} />,
        }}
      />
      <Stack.Screen
        name="finish"
        options={{
          title: 'Congratulations!',
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
