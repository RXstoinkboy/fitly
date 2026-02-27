import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { garmentsKeys } from './keys';
import { paths } from '@/constants/paths';
import { copyFile } from '@/utils/copy-file';
import * as FileSystem from 'expo-file-system/legacy';
import { GarmentType } from '@/lib/garments/types';

export const useAddGarment = ({
  type,
  options,
}: {
  type: GarmentType;
  options?: Omit<UseMutationOptions<void, Error, string, unknown>, 'mutationKey' | 'mutationFn'>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: garmentsKeys.add(type),
    mutationFn: async (imagePath: string) => {
      const filename = imagePath.split('/').pop();
      return copyFile(
        imagePath,
        `${FileSystem.documentDirectory}${paths.fileSystem.garments[type as keyof typeof paths.fileSystem.garments]}/`,
        filename ?? '',
      );
    },
    onSuccess: (data, variables, result, context) => {
      options?.onSuccess?.(data, variables, result, context);

      return queryClient.invalidateQueries({
        queryKey: garmentsKeys.list(type),
      });
    },
    ...options,
  });
};
