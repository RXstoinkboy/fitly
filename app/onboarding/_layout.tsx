import { Back, Next } from '@/components/onboarding/navigation';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
          headerLeft: () => <Back href={'/onboarding/select-garments'} />,
        }}
      />
    </Stack>
  );
}
