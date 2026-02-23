import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { imageGenerationValidator } from '#validators/image_generation_validator'

const GOOGLE_GENAI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent'
const DEFAULT_MIME_TYPE = 'image/jpeg'

export default class ImageGenerationController {
  async generate({ request, response }: HttpContext) {
    const payload = await imageGenerationValidator.validate(request.all())

    const apiKey = env.get('GOOGLE_API_KEY')
    const {
      modelImageBase64,
      mimeType,
      garmentTopImageBase64,
      garmentBottomImageBase64,
      garmentFullBodyImageBase64,
    } = payload

    const mime = mimeType ?? DEFAULT_MIME_TYPE
    let textPrompt = ''
    const imageParts: Array<{ inline_data: { mime_type: string; data: string } }> = []

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
      return response.badRequest({ error: 'No garment images provided.' })
    }

    const prompt = [{ text: textPrompt }, ...imageParts]

    const googleRes = await fetch(GOOGLE_GENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: prompt }],
      }),
    })

    if (!googleRes.ok) {
      const errText = await googleRes.text()
      return response.status(502).json({
        error: 'Google GenAI request failed',
        details: errText,
      })
    }

    const json = (await googleRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string } }> } }>
    }
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
