import { H6, Paragraph, XStack, YStack, Image } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoosePhoto } from '@/components/ui/choose-photo';
import { TakePhoto } from '@/components/ui/take-photo';
import { useLocalSearchParams } from 'expo-router';
import { useAddGarment } from '@/queries/garments/add-garment';
import { useGetGarmentsList } from '@/queries/garments/get-garments-list';
import { useContext } from 'react';
import { GarmentsContext } from '@/context/garment-context';

export default function GarmentsPicker() {
  const params = useLocalSearchParams();
  const type = params.type as string;
  const addGarment = useAddGarment({ type });
  const getGarmentsList = useGetGarmentsList({ type });
  const { setTop, setBottom } = useContext(GarmentsContext);
  const selectFunction = type === 'top' ? setTop : setBottom;

  return (
    <SafeAreaView flex={1}>
      <YStack gap={'$6'} px={'$2'}>
        <YStack gap={'$2'}>
          <H6>Add new</H6>
          <XStack gap={'$2'}>
            <ChoosePhoto
              onSuccess={(selectedGarment) => {
                addGarment.mutate(selectedGarment);
                selectFunction(selectedGarment);
              }}
            />
            <TakePhoto onSuccess={addGarment.mutate} />
          </XStack>
        </YStack>

        <YStack gap={'$2'}>
          <H6>Or select existing one</H6>
          {getGarmentsList.data?.length ? (
            <YStack gap={'$2'}>
              {getGarmentsList.data?.map((garment) => (
                <XStack key={garment}>
                  <Image source={{ uri: garment, width: 50, height: 50 }} />
                  <Paragraph>{garment}</Paragraph>
                </XStack>
              ))}
            </YStack>
          ) : (
            <Paragraph>No garments found</Paragraph>
          )}
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
