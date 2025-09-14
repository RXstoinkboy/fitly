import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { generateImage } from "./api";
import { ImageGenerationInput } from "./types";
import { generatedKeys } from "./keys";

export const useGenerateImageMutation = (
  options: UseMutationOptions<string | undefined, Error, ImageGenerationInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation<string | undefined, Error, ImageGenerationInput>({
    mutationKey: generatedKeys.add(),
    mutationFn: generateImage,
    onSuccess: (data, variables, context) => {
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Error generating image:", error);
      options.onError?.(error, variables, context);
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: generatedKeys.list(),
      });
    },
    ...options,
  });
};
