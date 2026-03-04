import { Camera } from '@/icons';
import { Button } from './button';
import { openCamera } from '@/utils/open-camera';

export const TakePhoto = ({ onSuccess }: { onSuccess?: (photo: string) => void }) => {
  const onCamera = async () => {
    const image = await openCamera();

    if (image) {
      onSuccess?.(image);
    }
  };

  return (
    <Button card={'outlined'} icon={Camera} onPress={onCamera}>
      Take photo
    </Button>
  );
};
