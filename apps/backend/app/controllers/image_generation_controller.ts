import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { imageGenerationValidator } from '#validators/image_generation_validator'
import { GoogleGenAI, type Part } from '@google/genai'

const DEFAULT_MIME_TYPE = 'image/jpeg'

function garmentLabel(field: string): string {
  const map: Record<string, string> = {
    garmentTopImageBase64: 'top garment',
    garmentBottomImageBase64: 'bottom garment',
    garmentFullBodyImageBase64: 'full-body garment',
    garmentOuterwearImageBase64: 'outerwear garment',
  }
  return map[field] ?? field
}

function buildPrompt(
  modelImageBase64: string,
  garments: { field: string; data: string }[],
): { textPrompt: string; imageParts: Part[] } {
  const mime = DEFAULT_MIME_TYPE
  const imageParts: Part[] = [{ inlineData: { mimeType: mime, data: modelImageBase64 } }]

  for (const garment of garments) {
    imageParts.push({ inlineData: { mimeType: mime, data: garment.data } })
  }

  if (garments.length === 1) {
    const label = garmentLabel(garments[0].field)
    const textPrompt = `
      Generate a new image where the person from the first image
      is wearing the ${label} from the second image.
      Make sure that the ${label} from the second image preserves its original fit, color, and details.
    `
    return { textPrompt, imageParts }
  }

  const descriptions = garments.map((g, index) => {
    const label = garmentLabel(g.field)
    const position = index + 2
    const suffix = getOrdinalSuffix(position)
    return `the ${label} from the ${position}${suffix} image`
  })

  const lastDesc = descriptions.pop()
  const allButLast = descriptions.join(', ')
  const combined = allButLast ? `${allButLast} and ${lastDesc}` : lastDesc

  const textPrompt = `
    Generate a new image where the person from the first image
    is wearing ${combined}.
    Make sure that all garments preserve their original fit, color, and details.
  `

  return { textPrompt, imageParts }
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] ?? s[v] ?? s[0]
}

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
      garmentOuterwearImageBase64,
    } = payload

    const mime = mimeType ?? DEFAULT_MIME_TYPE

    const garments: { field: string; data: string }[] = []
    if (garmentFullBodyImageBase64) {
      garments.push({ field: 'garmentFullBodyImageBase64', data: garmentFullBodyImageBase64 })
    }
    if (garmentTopImageBase64) {
      garments.push({ field: 'garmentTopImageBase64', data: garmentTopImageBase64 })
    }
    if (garmentBottomImageBase64) {
      garments.push({ field: 'garmentBottomImageBase64', data: garmentBottomImageBase64 })
    }
    if (garmentOuterwearImageBase64) {
      garments.push({ field: 'garmentOuterwearImageBase64', data: garmentOuterwearImageBase64 })
    }

    if (garments.length === 0) {
      return response.badRequest({ error: 'No garment images provided.' })
    }

    const { textPrompt, imageParts } = buildPrompt(modelImageBase64, garments)
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
