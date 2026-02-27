import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { garmentsKeys } from './keys';
import * as FileSystem from 'expo-file-system/legacy';

const remove = async (imagePath: string) => {
  return FileSystem.deleteAsync(imagePath, { idempotent: true });
};

export const useRemoveGarment = ({
  options,
}: {
  options?: Omit<UseMutationOptions<void, Error, string, unknown>, 'mutationKey' | 'mutationFn'>;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imagePath: string) => {
      return remove(imagePath);
    },
    onSuccess: (data, variables, result, context) => {
      options?.onSuccess?.(data, variables, result, context);

      return queryClient.invalidateQueries({
        queryKey: garmentsKeys.list(),
      });
    },
    ...options,
  });
};
