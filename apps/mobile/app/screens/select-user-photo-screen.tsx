import { useMount } from '@/hooks';
import { SelectPhotoSheet, useSelectPhotoSheet } from '@/components/modals';
import {
  PhotoGuidelinesInfoButton,
  PhotoGuidelinesSheet,
  usePhotoGuidelinesSheet,
} from '@/components/modals/photo-guidelines-sheet';
import {
  View,
  YStack,
  Text,
  Button,
  Image,
  XStack,
  ScreenWrapper,
  NoImagePlaceholder,
} from '@/components/v2/ui';
import { ImageSource, useModels, useOnboarding } from '@/state';
import { ArrowLeft, ImageUp } from '@/icons';
import { Link, usePathname } from 'expo-router';
import { useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { analyticsEvents, trackEvent } from '@/lib/analytics';

export function SelectUserPhotoScreen() {
  const { setOnboardingStep } = useOnboarding();
  const pathname = usePathname();

  const { currentModel, addModel, setCurrentModel, deleteModelPermanently } = useModels();
  const selectPhotoSheet = useSelectPhotoSheet();
  const photoGuidelinesSheet = usePhotoGuidelinesSheet();

  const handleAddModel = async (image: string, source: ImageSource): Promise&lt;void&gt; =&gt; {
    const id = await addModel(image, source);
    setCurrentModel(id);
    selectPhotoSheet.toggle(false);

    trackEvent(analyticsEvents.photos.added('model', source), {
      flow: 'onboarding',
      source,
    });
  };

  useMount(() =&gt; {
    setOnboardingStep(pathname);
    trackEvent(analyticsEvents.onboarding.stepViewed(), {
      step: pathname,
    });
  });

  useEffect(() =&gt; {
    if (!currentModel) {
      return;
    }

    const cleanupMissingModel = async () =&gt; {
      const fileInfo = await FileSystem.getInfoAsync(currentModel.filePath);
      if (!fileInfo.exists) {
        await deleteModelPermanently(currentModel.id);
      }
    };

    cleanupMissingModel();
  }, [currentModel, deleteModelPermanently]);

  return (
    &lt;ScreenWrapper
      footer={
        &lt;XStack&gt;
          &lt;Link asChild href={'/onboarding/welcome'}&gt;
            &lt;Button ghost icon={&lt;ArrowLeft /&gt;}&gt;
              Back
            &lt;/Button&gt;
          &lt;/Link&gt;
        &lt;/XStack&gt;
      }&gt;
      &lt;YStack flex={1} items={'center'} gap={'$4'}&gt;
        &lt;Text size="xxl" weight="semiBold"&gt;
          Take a photo of yourself
        &lt;/Text&gt;
        &lt;Text type="secondary" text="center"&gt;
          This photo will be used to try new outfits. Don’t worry, you can change it anytime
        &lt;/Text&gt;
        &lt;YStack gap={'$2'}&gt;
          {/* TODO: when no image then show a placeholder */}
          {currentModel ? (
            &lt;View width={300} height={400} rounded={'$7'} overflow="hidden" position="relative"&gt;
              &lt;Image
                src={currentModel?.filePath}
                width={300}
                height={400}
                rounded={'$7'}
                aspectRatio={3 / 4}
              /&gt;
            &lt;/View&gt;
          ) : (
            &lt;View
              width={300}
              height={400}
              rounded={'$7'}
              bg={'$color3'}
              overflow="hidden"
              onPress={() =&gt; {
                selectPhotoSheet.toggle();
              }}&gt;
              &lt;NoImagePlaceholder text="Add your photo" /&gt;
            &lt;/View&gt;
          )}

          &lt;PhotoGuidelinesInfoButton onPress={() =&gt; photoGuidelinesSheet.toggle()} /&gt;

          {currentModel ? (
            &lt;Button
              onPress={() =&gt; selectPhotoSheet.toggle()}
              position="absolute"
              t={10}
              r={10}
              rounded={'$radius.12'}
              icon={&lt;ImageUp /&gt;}
            /&gt;
          ) : null}
        &lt;/YStack&gt;

        {currentModel?.filePath ? (
          &lt;Link asChild href={'/onboarding/select-garments'}&gt;
            &lt;Button size="l"&gt;Go next!&lt;/Button&gt;
          &lt;/Link&gt;
        ) : null}
      &lt;/YStack&gt;
      &lt;SelectPhotoSheet
        isOpen={selectPhotoSheet.isOpen}
        toggle={selectPhotoSheet.toggle}
        onSuccess={handleAddModel}
        subject="model"
        flow="onboarding"
      /&gt;
      &lt;PhotoGuidelinesSheet
        isOpen={photoGuidelinesSheet.isOpen}
        toggle={photoGuidelinesSheet.toggle}
      /&gt;
    &lt;/ScreenWrapper&gt;
  );
}