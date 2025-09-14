import { paths } from "@/constants/paths";
import { getFilesList } from "@/lib/get-files-list";
import { useQuery } from "@tanstack/react-query";
import { generatedKeys } from "./keys";

export const useGetGeneratedImagesList = () => {
  return useQuery({
    queryKey: generatedKeys.list(),
    queryFn: async () => {
      const models = await getFilesList(paths.fileSystem.generated);
      return models;
    },
  });
};
