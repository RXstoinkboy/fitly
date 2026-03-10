import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { generateImage } from './api';
import { generatedKeys } from './keys';
import { fileUriToBase64 } from '@/utils/file-uri-to-base64';
import { saveToFileSystem } from '@/utils/save-to-file-system';
import { paths } from '@/constants/paths';
import { useModels } from '@/state';
import { GarmentType } from '@/state/types';
import { analyticsEvents, captureError, trackEvent } from '@/lib/analytics';
import { AnalyticsFlow } from '@/lib/analytics/types';

type GenerateImageParams = {
  top?: string;
  bottom?: string;
  garments?: { ids: string[]; types: GarmentType[]; count: number };
  context?: AnalyticsFlow;
  modelId?: string | null;
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

  return useMutation<GenerateImageResult | undefined, Error, GenerateImageParams>({
    mutationKey: generatedKeys.add(),
    mutationFn: async ({ top, bottom }) => {
      const [modelImageBase64, garmentTopImageBase64, garmentBottomImageBase64] = await Promise.all(
        [fileUriToBase64(currentModel?.filePath), fileUriToBase64(top), fileUriToBase64(bottom)],
      );

      const result = await generateImage({
        modelImageBase64,
        garmentTopImageBase64,
        garmentBottomImageBase64,
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
