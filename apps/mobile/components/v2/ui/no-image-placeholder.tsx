import { YStack } from './y-stack';
import { Text } from './text';
import { ImageOff } from '@/icons';

type NoImagePlaceholderProps = {
  text?: string;
};

export const NoImagePlaceholder = ({ text = 'No image' }: NoImagePlaceholderProps) => {
  return (
    <YStack bg={'$color3'} flex={1} width={'100%'} items={'center'} justify={'center'} gap={'$2'}>
      <ImageOff size={'$6'} color={'$color11'} />
      <Text type="secondary">{text}</Text>
    </YStack>
  );
};
