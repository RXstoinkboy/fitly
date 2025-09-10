import { GoogleGenAI } from "@google/genai";
import { ImageGenerationInput } from "./types";
import { paths } from "@/constants/paths";
import { saveToFileSystem } from "@/lib/save-to-file-system";

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export async function generateImage({
  modelImageBase64,
  mimeType,
  garmentTopImageBase64,
  garmentBottomImageBase64,
  garmentFullBodyImageBase64,
}: ImageGenerationInput): Promise<string | undefined> {
  if (!apiKey) {
    throw new Error(
      "Google API Key is not defined. Please set EXPO_PUBLIC_GOOGLE_API_KEY.",
    );
  }

  const mime = mimeType || "image/jpeg";

  const ai = new GoogleGenAI({ apiKey });

  let textPrompt: string;
  const imageParts = [];

  // The model image is always the first image after the initial text.
  imageParts.push({
    inlineData: {
      mimeType: mime,
      data: modelImageBase64,
    },
  });

  if (garmentFullBodyImageBase64) {
    // If full-body garment, it's the second image.
    textPrompt = `
        Generate a new image where the person from the first image
        is wearing the full-body garment from the second image.
        Make sure that the full-body garment from the second image and bottom garment from the third image preserves its original fit, color, and details.
      `;
    imageParts.push({
      inlineData: {
        mimeType: mime,
        data: garmentFullBodyImageBase64,
      },
    });
  } else if (garmentTopImageBase64 && garmentBottomImageBase64) {
    // If top and bottom garments, top is the second image, bottom is the third.
    textPrompt = `
        Generate a new image where the person from the first image
        is wearing the top garment from the second image and the bottom garment from the third image.
        Make sure that the top garment from the second image and bottom garment from the third image preserves its original fit, color, and details.
      `;
    imageParts.push({
      inlineData: {
        mimeType: mime,
        data: garmentTopImageBase64,
      },
    });
    imageParts.push({
      inlineData: {
        mimeType: mime,
        data: garmentBottomImageBase64,
      },
    });
  } else if (garmentTopImageBase64) {
    // If only top garment, it's the second image.
    textPrompt = `
        Generate a new image where the person from the first image
        is wearing the top garment from the second image.
        Make sure that the top garment from the second image preserves its original fit, color, and details.
      `;
    imageParts.push({
      inlineData: {
        mimeType: mime,
        data: garmentTopImageBase64,
      },
    });
  } else if (garmentBottomImageBase64) {
    // If only bottom garment, it's the second image.
    textPrompt = `
        Generate a new image where the person from the first image
        is wearing the bottom garment from the second image.
        Make sure that the bottom garment from the second image preserves its original fit, color, and details.
      `;
    imageParts.push({
      inlineData: {
        mimeType: mime,
        data: garmentBottomImageBase64,
      },
    });
  } else {
    throw new Error("No garment images provided.");
  }

  const prompt = [{ text: textPrompt }, ...imageParts];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    const parts = response.candidates?.[0].content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;

        if (imageData) {
          return saveToFileSystem(paths.fileSystem.generated, imageData);
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
