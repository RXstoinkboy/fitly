import { YStack, Text } from '.';

export const NoImagePlaceholder = () => {
  return (
    <YStack bg={'$color3'} flex={1} width={'100%'} items={'center'} justify={'center'}>
      <Text type="secondary">No image</Text>
    </YStack>
  );
};
