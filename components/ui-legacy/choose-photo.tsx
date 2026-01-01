import { GalleryHorizontalEnd } from '@tamagui/lucide-icons';
import { Button } from '@/components/ui-legacy/button';
import { openImageLibrary } from '@/utils/open-image-library';

export const ChoosePhoto = ({ onSuccess }: { onSuccess?: (image: string) => void }) => {
  const onSelectImage = async () => {
    const image = await openImageLibrary();

    if (image) {
      onSuccess?.(image);
    }
  };
  return (
    <Button card={'outlined'} icon={GalleryHorizontalEnd} onPress={onSelectImage}>
      Choose photo
    </Button>
  );
};
