import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { generateImage } from './api';
import { generatedKeys } from './keys';
import { fileUriToBase64 } from '@/utils/file-uri-to-base64';
import { saveToFileSystem } from '@/utils/save-to-file-system';
import { paths } from '@/constants/paths';
import { state, useModels } from '@/state';
import { GarmentType } from '@/state/types';
import { analyticsEvents, captureError, trackEvent } from '@/lib/analytics';
import { AnalyticsFlow } from '@/lib/analytics/types';
import { useSubscriptionStatus } from '@/queries/subscription';

type GenerateImageParams = {
  top?: string;
  bottom?: string;
  dress?: string;
  outerwear?: string;
  garments?: { ids: string[]; types: GarmentType[]; count: number };
  context?: AnalyticsFlow;
  modelId?: string | null;
  isSubscribed?: boolean;
};

type GenerateImageResult = {
  generatedImageBase64: string;
  mimeType: string;
  filePath: string;
};

export const useGenerateImageMutation = (
  options: UseMutationOptions<GenerateImageResult | undefined, Error, GenerateImageParams> = {},
) => {
  const queryClient = useQueryClient();
  const { currentModel } = useModels();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const isSubscribed = subscriptionStatus?.isSubscribed ?? false;

  return useMutation<GenerateImageResult | undefined, Error, GenerateImageParams>({
    mutationKey: generatedKeys.add(),
    mutationFn: async ({ top, bottom, dress, outerwear }) => {
      if (!currentModel?.filePath) {
        throw new Error('Model photo is missing. Please select your photo again.');
      }

      let modelImageBase64 = '';

      try {
        modelImageBase64 = await fileUriToBase64(currentModel.filePath);
      } catch {
        await state.actions.deleteModelPermanently(currentModel.id);
        throw new Error('Model photo is missing. Please select your photo again.');
      }

      const [
        garmentTopImageBase64,
        garmentBottomImageBase64,
        garmentFullBodyImageBase64,
        garmentOuterwearImageBase64,
      ] = await Promise.all([
        top ? fileUriToBase64(top) : Promise.resolve(undefined),
        bottom ? fileUriToBase64(bottom) : Promise.resolve(undefined),
        dress ? fileUriToBase64(dress) : Promise.resolve(undefined),
        outerwear ? fileUriToBase64(outerwear) : Promise.resolve(undefined),
      ]);

      const result = await generateImage({
        modelImageBase64,
        garmentTopImageBase64,
        garmentBottomImageBase64,
        isSubscribed,
        garmentFullBodyImageBase64,
        garmentOuterwearImageBase64,
      });

      if (!result) {
        return undefined;
      }

      const filePath = await saveToFileSystem(
        paths.fileSystem.generated,
        result.generatedImageBase64,
      );

      return {
        ...result,
        filePath,
      };
    },
    onSuccess: (data, variables, result, context) => {
      if (data) {
        console.log('Generated image saved to:', data.filePath);
        trackEvent(analyticsEvents.generation.succeeded(variables.context ?? 'app'), {
          garmentCount: variables.garments?.count ?? 0,
          garmentTypes: variables.garments?.types ?? [],
          modelId: variables.modelId ?? currentModel?.id,
          flow: variables.context ?? 'app',
        });
      }

      options.onSuccess?.(data, variables, result, context);
    },
    onError: (error, variables, result, context) => {
      console.error('Error generating image:', error);
      trackEvent(analyticsEvents.generation.failed(variables.context ?? 'app'), {
        garmentCount: variables.garments?.count ?? 0,
        garmentTypes: variables.garments?.types ?? [],
        modelId: variables.modelId ?? currentModel?.id,
        flow: variables.context ?? 'app',
      });
      captureError(error, {
        event: analyticsEvents.generation.failed(variables.context ?? 'app'),
        flow: variables.context ?? 'app',
      });
      options.onError?.(error, variables, result, context);
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: generatedKeys.list(),
      });
    },
    ...options,
  });
};
