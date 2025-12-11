import { paths } from '@/constants/paths';
import { getFilesList } from '@/lib/get-files-list';
import { useQuery } from '@tanstack/react-query';
import { garmentsKeys } from './keys';
import { GarmentType } from '@/lib/garments/types';

export const useGetGarmentsList = ({ type }: { type: GarmentType }) => {
  return useQuery({
    queryKey: garmentsKeys.list(type),
    queryFn: async () => {
      const models = await getFilesList(
        paths.fileSystem.garments[type as keyof typeof paths.fileSystem.garments],
      );
      return models;
    },
  });
};
