import { View, YStack, Text, Button, ScreenWrapper } from '@/components/v2/ui';
import { Link } from 'expo-router';

export default function Welcome() {
  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} justify={'center'} gap={'$4'} bg="transparent">
        <Text size="xxl" weigth="semiBold">
          Welcome!
        </Text>
        {/* TODO: replace with some attractive stock image */}
        <View width={'90%'} aspectRatio={3 / 4} bg={'$accent11'} rounded={'$7'} />
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
