import { router, useLocalSearchParams } from 'expo-router';
import { ImageDetailContent } from '@/components/gallery/image-detail-modal';
import { state } from '@/state';
import { ImageUp } from '@/icons';

export default function ModelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const model = id ? state.store.models[id].get() : null;

  if (!model || !id) {
    router.back();
    return null;
  }

  const handleUseAsCurrent = () => {
    state.actions.setCurrentModel(id);
    router.navigate('/(tabs)/settings');
  };

  return (
    <ImageDetailContent
      imageUri={model.filePath}
      isGenerated={false}
      onClose={() => router.back()}
      showDelete={false}
      showShare={false}
      primaryAction={{
        label: 'Use this model',
        onPress: handleUseAsCurrent,
        icon: <ImageUp color="white" size={22} />,
      }}
    />
  );
}
