import { useMutation } from "@tanstack/react-query";
import { modelsKeys } from "./keys";
import { saveToFileSystem } from "@/lib/save-to-file-system";
import { paths } from "@/constants/paths";

export const useAddModel = () => {
  return useMutation({
    mutationKey: modelsKeys.add(),
    mutationFn: async (imageData: string) => {
      return saveToFileSystem(paths.fileSystem.models, imageData);
    },
  });
};
