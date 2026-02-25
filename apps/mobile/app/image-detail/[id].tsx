import { router, useLocalSearchParams } from 'expo-router';
import { ImageDetailContent } from '@/components/gallery/image-detail-modal';
import { state } from '@/state';
import type { ImageDetailType } from '@/components/gallery/types';

export default function ImageDetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: ImageDetailType }>();

  const image = (() => {
    if (type === 'generated') {
      return state.store.generatedImages[id].get();
    } else if (type === 'top') {
      return state.store.garments.top[id].get();
    } else {
      return state.store.garments.bottom[id].get();
    }
  })();

  if (!image) {
    router.back();
    return null;
  }

  const handleRemove = () => {
    if (type === 'generated') {
      state.actions.removeGeneratedImage(id);
    } else {
      state.actions.removeGarment(id, type);
    }
  };

  return (
    <ImageDetailContent
      imageUri={image.filePath}
      isGenerated={type === 'generated'}
      onClose={() => router.back()}
      onRemove={handleRemove}
    />
  );
}
