import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsKeys } from './keys';
import { paths } from '@/constants/paths';
import { copyFile } from '@/lib/copy-file';
import * as FileSystem from 'expo-file-system';

// TODO: might extend in future more model metadata
// TODO: error handling
// TODO: might extend in future to store multiple model images and allow user to change them
export const useAddModelImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: modelsKeys.add(),
    mutationFn: async (imagePath: string) => {
      const filename = imagePath.split('/').pop();
      return copyFile(
        imagePath,
        `${FileSystem.documentDirectory}${paths.fileSystem.models}/`,
        filename ?? '',
      );
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: modelsKeys.list(),
      });
    },
  });
};
