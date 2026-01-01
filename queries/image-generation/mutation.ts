import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { generateImage } from './api';
import { generatedKeys } from './keys';
import { fileUriToBase64 } from '@/lib/file-uri-to-base64';
import { useGetModelsList } from '../models/get-models-list';
import { saveToFileSystem } from '@/lib/save-to-file-system';
import { paths } from '@/constants/paths';

type GenerateImageParams = { top?: string; bottom?: string };

export const useGenerateImageMutation = (
  options: UseMutationOptions<
    { generatedImageBase64: string; mimeType: string } | undefined,
    Error,
    GenerateImageParams
  > = {},
) => {
  const queryClient = useQueryClient();
  const models = useGetModelsList();

  return useMutation<
    { generatedImageBase64: string; mimeType: string } | undefined,
    Error,
    GenerateImageParams
  >({
    mutationKey: generatedKeys.add(),
    mutationFn: async ({ top, bottom }) => {
      const [modelImageBase64, garmentTopImageBase64, garmentBottomImageBase64] = await Promise.all(
        [fileUriToBase64(models.data?.at(-1)), fileUriToBase64(top), fileUriToBase64(bottom)],
      );

      return generateImage({
        modelImageBase64,
        garmentTopImageBase64,
        garmentBottomImageBase64,
      });
    },
    onSuccess: (data, variables, result, context) => {
      if (data) {
        console.log('data', data);
        saveToFileSystem(paths.fileSystem.generated, data.generatedImageBase64);
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
