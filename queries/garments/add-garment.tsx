import { useMutation, useQueryClient } from "@tanstack/react-query";
import { garmentsKeys } from "./keys";
import { paths } from "@/constants/paths";
import { copyFile } from "@/lib/copy-file";
import * as FileSystem from "expo-file-system";

export const useAddGarment = ({ type }: { type: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: garmentsKeys.add(type),
    mutationFn: async (imagePath: string) => {
      const filename = imagePath.split("/").pop();
      return copyFile(
        imagePath,
        `${FileSystem.documentDirectory}${paths.fileSystem.garments[type as keyof typeof paths.fileSystem.garments]}/`,
        filename ?? "",
      );
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: garmentsKeys.list(type),
      });
    },
  });
};
