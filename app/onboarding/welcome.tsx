import { YStack, Text, Button } from '@/components/v2/ui';

export default function Onboarding() {
  return (
    <YStack flex={1} items={'center'} gap={'$4'}>
      <Text size="xxl" weigth="semiBold">
        Welcome screen
      </Text>
      <Text type="secondary" text="center">
        You’re one step closer to trying on your favourite styles, right from home
      </Text>
      <Button stretched>Let's get started!</Button>
    </YStack>
  );
}
