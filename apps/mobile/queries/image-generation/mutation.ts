import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { generateImage } from './api';
import { generatedKeys } from './keys';
import { fileUriToBase64 } from '@/utils/file-uri-to-base64';
import { useGetModelsList } from '../models/get-models-list';
import { saveToFileSystem } from '@/utils/save-to-file-system';
import { paths } from '@/constants/paths';

type GenerateImageParams = { top?: string; bottom?: string };

type GenerateImageResult = {
  generatedImageBase64: string;
  mimeType: string;
  filePath: string;
};

export const useGenerateImageMutation = (
  options: UseMutationOptions<GenerateImageResult | undefined, Error, GenerateImageParams> = {},
) => {
  const queryClient = useQueryClient();
  const models = useGetModelsList();

  return useMutation<GenerateImageResult | undefined, Error, GenerateImageParams>({
    mutationKey: generatedKeys.add(),
    mutationFn: async ({ top, bottom }) => {
      const [modelImageBase64, garmentTopImageBase64, garmentBottomImageBase64] = await Promise.all(
        [fileUriToBase64(models.data?.at(-1)), fileUriToBase64(top), fileUriToBase64(bottom)],
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
      }

      options.onSuccess?.(data, variables, result, context);
    },
    onError: (error, variables, result, context) => {
      console.error('Error generating image:', error);
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
