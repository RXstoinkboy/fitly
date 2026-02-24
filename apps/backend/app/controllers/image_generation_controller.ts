import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { imageGenerationValidator } from '#validators/image_generation_validator'
import type { GoogleGenAIResponse, GoogleGenAIInlineImagePart } from '#types/google_genai'

const DEFAULT_GENAI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent'
const DEFAULT_MIME_TYPE = 'image/jpeg'

export default class ImageGenerationController {
  async generate({ request, response }: HttpContext) {
    const payload = await imageGenerationValidator.validate(request.all())

    const apiKey = env.get('GOOGLE_API_KEY')
    const genaiEndpoint = env.get('GOOGLE_GENAI_ENDPOINT') ?? DEFAULT_GENAI_ENDPOINT

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
    const imageParts: GoogleGenAIInlineImagePart[] = []

    imageParts.push({ inline_data: { mime_type: mime, data: modelImageBase64 } })

    if (garmentFullBodyImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the full-body garment from the second image.
        Make sure that the full-body garment from the second image preserves its original fit, color, and details.
      `
      imageParts.push({ inline_data: { mime_type: mime, data: garmentFullBodyImageBase64 } })
    } else if (garmentTopImageBase64 && garmentBottomImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the top garment from the second image and the bottom garment from the third image.
        Make sure that the top garment from the second image and bottom garment from the third image preserves its original fit, color, and details.
      `
      imageParts.push({ inline_data: { mime_type: mime, data: garmentTopImageBase64 } })
      imageParts.push({ inline_data: { mime_type: mime, data: garmentBottomImageBase64 } })
    } else if (garmentTopImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the top garment from the second image.
        Make sure that the top garment from the second image preserves its original fit, color, and details.
      `
      imageParts.push({ inline_data: { mime_type: mime, data: garmentTopImageBase64 } })
    } else if (garmentBottomImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the bottom garment from the second image.
        Make sure that the bottom garment from the second image preserves its original fit, color, and details.
      `
      imageParts.push({ inline_data: { mime_type: mime, data: garmentBottomImageBase64 } })
    } else {
      // NOTE: Validator enforces at least one garment field, so this branch should
      // never be reached in practice — kept as a defensive fallback.
      return response.badRequest({ error: 'No garment images provided.' })
    }

    const prompt = [{ text: textPrompt }, ...imageParts]

    // TODO: Migrate from native fetch to axios. Create a shared axios instance
    //       configured with base URL, default headers, and interceptors for
    //       consistent error handling and request logging.
    const googleResponse = await fetch(genaiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: prompt }],
      }),
    })

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text()

      // TODO: Improve error handling — introduce a structured error system (e.g.
      //       custom error classes or an error registry) so upstream errors from
      //       Google GenAI are normalised and consistently formatted for the client.
      // TODO: Standardise HTTP status codes using a dedicated library (e.g.
      //       `http-status-codes`) to replace magic numeric literals like 502.
      return response.status(502).json({
        error: 'Google GenAI request failed',
        details: errorText,
      })
    }

    const json = (await googleResponse.json()) as GoogleGenAIResponse
    const parts = json?.candidates?.[0]?.content?.parts ?? []

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
