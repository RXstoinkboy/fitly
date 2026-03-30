import { useOnboarding } from '@/state';
import { type Href, Redirect, Stack, useSegments } from 'expo-router';

export default function OnboardingLayout() {
  // TODO: redirect to current step when user was in progress
  const { currentStep, isCompleted } = useOnboarding();
  const segments = useSegments();
  const isAtRoot = segments[segments.length - 1] === 'onboarding';

  if (currentStep && !isCompleted && isAtRoot) {
    return <Redirect href={currentStep as Href} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="select-user-photo" />
      <Stack.Screen name="select-garments" />
      <Stack.Screen name="finish" />
    </Stack>
  );
}
