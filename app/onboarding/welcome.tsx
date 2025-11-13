import { YStack, Text, Button } from '@/components/v2/ui';
import { Link } from 'expo-router';

export default function Welcome() {
  return (
    <YStack flex={1} items={'center'} gap={'$4'}>
      <Text size="xxl" weigth="semiBold">
        Welcome screen
      </Text>
      <Text type="secondary" text="center">
        You’re one step closer to trying on your favourite styles, right from home
      </Text>
      <Link href="/onboarding/select-user-photo" asChild>
        <Button stretched>Let&apos;s get started!</Button>
      </Link>
    </YStack>
  );
}
