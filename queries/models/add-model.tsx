import { useMutation, useQueryClient } from "@tanstack/react-query";
import { modelsKeys } from "./keys";
import { paths } from "@/constants/paths";
import { copyFile } from "@/lib/copy-file";
import * as FileSystem from "expo-file-system";

export const useAddModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: modelsKeys.add(),
    mutationFn: async (imagePath: string) => {
      const filename = imagePath.split("/").pop();
      return copyFile(
        imagePath,
        `${FileSystem.documentDirectory}${paths.fileSystem.models}/${filename}`,
      );
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: modelsKeys.list(),
      });
    },
  });
};
