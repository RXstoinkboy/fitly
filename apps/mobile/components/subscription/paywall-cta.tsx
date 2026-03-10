import { useCallback } from 'react';
import { Button, Text, YStack } from '@/components/v2/ui';
import { usePaywall } from '@/hooks/use-paywall';

type PaywallCtaProps = {
  onPaywallFinished?: (isSubscribed: boolean) => void;
};

export const PaywallCta = ({ onPaywallFinished }: PaywallCtaProps) => {
  const { showPaywall, isPresenting, status } = usePaywall();

  const handleOpen = useCallback(async () => {
    const result = await showPaywall();
    onPaywallFinished?.(result.status.isSubscribed);
  }, [onPaywallFinished, showPaywall]);

  return (
    <YStack
      width="100%"
      gap="$2"
      p="$3"
      bg="$color2"
      rounded="$4"
      items="center"
      borderWidth={1}
      borderColor="$color6">
      <Text size="l" weigth="semiBold" text="center">
        Unlock unlimited try-ons
      </Text>
      <Text type="secondary" text="center">
        Subscribe to keep generating outfits without interruptions. RevenueCat powers billing so you
        can manage your plan anytime.
      </Text>
      <Button width="100%" disabled={isPresenting} onPress={handleOpen}>
        {isPresenting
          ? 'Opening paywall...'
          : status.isSubscribed
            ? 'Manage subscription'
            : 'See plans'}
      </Button>
    </YStack>
  );
};
