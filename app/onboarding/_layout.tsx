import { Back, Next } from '@/components/onboarding/navigation';
import { XStack } from '@/components/v2/ui';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  // TODO: refactor set onboarding step to use path names instead of numbers
  // TODO: redirect to current step when user was in progress
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // headerTitle: '',
        // headerBackVisible: false,
        // headerStyle: {
        //   height: HEADER_HEIGHT,
        // } as StyleProp<{ backgroundColor?: string; height?: number }>,
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
          headerLeft: () => <Back href={'/onboarding/select-garments'} />,
        }}
      />
    </Stack>
  );
}
