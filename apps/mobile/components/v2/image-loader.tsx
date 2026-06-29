import { useCurrentModel } from '@/state';
import { YStack, Text, Image, Spinner } from '@/components/v2/ui';
import { useLoadingState } from '@/hooks/use-loading-state';

type ImageLoaderProps = {
  wrapped?: boolean;
  width?: number;
  height?: number;
};

export const ImageLoader = ({ wrapped = true, width = 300, height = 400 }: ImageLoaderProps) => {
  const { currentModel } = useCurrentModel();
  const loadingState = useLoadingState({ isPending: true });

  const loader = (
    <>
      <YStack
        position="absolute"
        z={'$1'}
        t={'50%'}
        l={'50%'}
        items={'center'}
        transform={'translate(-50%, -50%)'}>
        <Spinner size="large" color="$accent2" />
        <Text color="$color1">{loadingState}</Text>
      </YStack>
      <Image
        src={currentModel?.filePath}
        width={width}
        height={height * 1.1}
        aspectRatio={3 / 4}
        objectFit="cover"
        blurRadius={80}
      />
    </>
  );

  if (wrapped) {
    return (
      <YStack
        width={width}
        height={height}
        rounded={'$7'}
        overflow="hidden"
        justify={'center'}
        items={'center'}
        position="relative">
        {loader}
      </YStack>
    );
  }

  return <>{loader}</>;
};
