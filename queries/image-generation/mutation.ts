import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { generateImage } from "./api";
import { ImageGenerationInput } from "./types";

export const useGenerateImageMutation = (
  options: UseMutationOptions<string | undefined, Error, ImageGenerationInput>,
) => {
  return useMutation<string | undefined, Error, ImageGenerationInput>({
    mutationFn: generateImage,
    onSuccess: (data, variables, context) => {
      console.log("Image generated successfully:", data);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Error generating image:", error);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
