import { YStack, Text, Button, ScreenWrapper } from '@/components/v2/ui';
import { Link } from 'expo-router';

export default function Welcome() {
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
          <Button type="primary" stretched>
            Let&apos;s get started!
          </Button>
        </Link>
      </YStack>
    </ScreenWrapper>
  );
}
