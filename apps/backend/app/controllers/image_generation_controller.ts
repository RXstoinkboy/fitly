import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { imageGenerationValidator } from '#validators/image_generation_validator'
import { GoogleGenAI, type Part } from '@google/genai'

const DEFAULT_MIME_TYPE = 'image/jpeg'

export default class ImageGenerationController {
  async generate({ request, response }: HttpContext) {
    const payload = await imageGenerationValidator.validate(request.all())

    const apiKey = env.get('GOOGLE_API_KEY')
    const ai = new GoogleGenAI({ apiKey })

    const {
      modelImageBase64,
      mimeType,
      garmentTopImageBase64,
      garmentBottomImageBase64,
      garmentFullBodyImageBase64,
    } = payload

    const mime = mimeType ?? DEFAULT_MIME_TYPE

    // TODO: Refactor prompt building into a dedicated service with better handling of
    //       different garment types, combinations, and edge cases. Consider adding
    //       validation that a given garment image actually matches the stated type
    //       (top, bottom, full-body) using a pre-classification step.
    let textPrompt = ''
    const imageParts: Part[] = []

    imageParts.push({ inlineData: { mimeType: mime, data: modelImageBase64 } })

    if (garmentFullBodyImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the full-body garment from the second image.
        Make sure that the full-body garment from the second image preserves its original fit, color, and details.
      `
      imageParts.push({ inlineData: { mimeType: mime, data: garmentFullBodyImageBase64 } })
    } else if (garmentTopImageBase64 && garmentBottomImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the top garment from the second image and the bottom garment from the third image.
        Make sure that the top garment from the second image and bottom garment from the third image preserves its original fit, color, and details.
      `
      imageParts.push({ inlineData: { mimeType: mime, data: garmentTopImageBase64 } })
      imageParts.push({ inlineData: { mimeType: mime, data: garmentBottomImageBase64 } })
    } else if (garmentTopImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the top garment from the second image.
        Make sure that the top garment from the second image preserves its original fit, color, and details.
      `
      imageParts.push({ inlineData: { mimeType: mime, data: garmentTopImageBase64 } })
    } else if (garmentBottomImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the bottom garment from the second image.
        Make sure that the bottom garment from the second image preserves its original fit, color, and details.
      `
      imageParts.push({ inlineData: { mimeType: mime, data: garmentBottomImageBase64 } })
    } else {
      // NOTE: Validator enforces at least one garment field, so this branch should
      // never be reached in practice — kept as a defensive fallback.
      return response.badRequest({ error: 'No garment images provided.' })
    }

    const prompt: Part[] = [{ text: textPrompt }, ...imageParts]

    let googleResponse
    try {
      googleResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: prompt,
      })
    } catch (err) {
      // TODO: Improve error handling — introduce a structured error system (e.g.
      //       custom error classes or an error registry) so upstream errors from
      //       Google GenAI are normalised and consistently formatted for the client.
      // TODO: Standardise HTTP status codes using a dedicated library (e.g.
      //       `http-status-codes`) to replace magic numeric literals like 502.
      return response.status(502).json({
        error: 'Google GenAI request failed',
        details: err instanceof Error ? err.message : String(err),
      })
    }

    const parts = googleResponse.candidates?.[0]?.content?.parts ?? []

    for (const part of parts) {
      if (part.inlineData?.data) {
        return response.json({
          generatedImageBase64: part.inlineData.data,
          mimeType: mime,
        })
      }
    }

    return response.json({ generatedImageBase64: null })
  }
}
