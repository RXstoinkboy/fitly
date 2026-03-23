import { useMount } from '@/hooks';
import { YStack, Text, Button, ScreenWrapper } from '@/components/v2/ui';
import { useOnboarding } from '@/state';
import { Link, usePathname } from 'expo-router';
import { analyticsEvents, trackEvent } from '@/lib/analytics';

export default function Welcome() {
  const { setOnboardingStep } = useOnboarding();
  const pathname = usePathname();

  useMount(() => {
    setOnboardingStep(pathname);
    trackEvent(analyticsEvents.onboarding.stepViewed(), {
      step: pathname,
    });
  });

  const handleStart = () => {
    trackEvent(analyticsEvents.onboarding.started(), {
      step: pathname,
    });
  };

  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} gap={'$4'} bg="transparent">
        {/* TODO: add here some attractive stock image */}
        <Text size="xxl" weigth="semiBold">
          Welcome screen
        </Text>
        <Text type="secondary" text="center">
          You’re one step closer to trying on your favourite styles, right from home
        </Text>
        <Link href="/onboarding/select-user-photo" asChild>
          <Button onPress={handleStart}>Let&apos;s get started!</Button>
        </Link>
      </YStack>
    </ScreenWrapper>
  );
}
