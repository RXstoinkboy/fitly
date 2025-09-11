import { useMutation } from "@tanstack/react-query";
import { garmentsKeys } from "./keys";
import { paths } from "@/constants/paths";
import { copyFile } from "@/lib/copy-file";
import * as FileSystem from "expo-file-system";

export const useAddModel = ({ type }: { type: string }) => {
  return useMutation({
    mutationKey: garmentsKeys.add(type),
    mutationFn: async (imagePath: string) => {
      const filename = imagePath.split("/").pop();
      return copyFile(
        imagePath,
        `${FileSystem.documentDirectory}${paths.fileSystem.garments}/${filename}`,
      );
    },
  });
};
