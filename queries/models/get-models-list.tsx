import { paths } from '@/constants/paths';
import { getFilesList } from '@/lib/get-files-list';
import { useQuery } from '@tanstack/react-query';
import { modelsKeys } from './keys';

export const useGetModelsList = () => {
  return useQuery({
    queryKey: modelsKeys.list(),
    queryFn: async () => {
      const models = await getFilesList(paths.fileSystem.models);
      return models;
    },
  });
};
