import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { modelsKeys } from './keys';
import { paths } from '@/constants/paths';
import { copyFile } from '@/utils/copy-file';
import * as FileSystem from 'expo-file-system/legacy';

// TODO: might extend in future more model metadata
// TODO: error handling
// TODO: might extend in future to store multiple model images and allow user to change them
export const useAddModelImage = (
  options?: Omit<UseMutationOptions<void, Error, string, unknown>, 'mutationKey' | 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationKey: modelsKeys.add(),
    mutationFn: async (imagePath: string) => {
      const filename = imagePath.split('/').pop();
      return copyFile(
        imagePath,
        `${FileSystem.documentDirectory}${paths.fileSystem.models}/`,
        filename ?? '',
      );
    },
    onSuccess: (data, variables, result, context) => {
      options?.onSuccess?.(data, variables, result, context);
      return queryClient.invalidateQueries({
        queryKey: modelsKeys.list(),
      });
    },
  });
};
