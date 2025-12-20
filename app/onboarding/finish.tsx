import { YStack, Text, ScreenWrapper } from '@/components/v2/ui';

export default function Onboarding() {
  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold" text={'center'}>
          {'Congratulations!'}
        </Text>
        <Text type="secondary" text="center">
          That&apos;s just the beginning. Now you can explore the app and start trying on outfits!
        </Text>
      </YStack>
    </ScreenWrapper>
  );
}
