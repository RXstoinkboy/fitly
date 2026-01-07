import { Model } from '@/db/models';
import { View, Image, Button, Text } from '../v2/ui';
import { withObservables } from '@nozbe/watermelondb/react';
import { ImageUp } from '@tamagui/lucide-icons';
import { map, Observable } from 'rxjs';

type UserPhotoProps = {
  onReplace?: () => void;
  model?: Model;
};

const enhance = withObservables<UserPhotoProps, { model?: Observable<Model> }>(
  ['model'],
  ({ model }) => ({
    model: model ? model.observe().pipe(map((arr: any) => arr[0])) : undefined,
  }),
);

export const UserPhoto = enhance(({ onReplace, model }: UserPhotoProps) => {
  return (
    <View position={'relative'}>
      <Text>{JSON.stringify(model)}</Text>
      <Image
        source={{ uri: model?.filePath, width: 300, height: 400 }}
        rounded={'$7'}
        aspectRatio={3 / 4}
      />
      <Button
        onPress={onReplace}
        position="absolute"
        t={10}
        r={10}
        rounded={'$radius.12'}
        icon={<ImageUp />}
      />
    </View>
  );
});
