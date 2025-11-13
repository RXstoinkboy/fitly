import { YStack, Text, Button } from '@/components/v2/ui';
import { SelectPhotoModal, useModal } from '@/components/modals';

export default function SelectUserPhoto() {
  const { isOpen, closeModal, openModal, setIsOpen } = useModal();
  return (
    <>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold">
          Take a photo of yourself
        </Text>
        <Text type="secondary" text="center">
          This photo will be used to try new outfits. Don’t worry, you can change it anytime
        </Text>
        <Button stretched onPress={openModal}>
          Select photo
        </Button>
        {/* TODO: change to "Change" / "Go to next step" after photo is selected? */}
        <YStack width={'100%'} items={'flex-start'}>
          <Text>Photo guidelines for best results:</Text>
          <Text pl={'$3'}>1. Plain background</Text>
          <Text pl={'$3'}>2. Good lightning</Text>
          <Text pl={'$3'}>3. Full body visible</Text>
          <Text pl={'$3'}>4. Wear fitted clothes</Text>
        </YStack>
      </YStack>
      <SelectPhotoModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
