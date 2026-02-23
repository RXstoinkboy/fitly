import vine from '@vinejs/vine'

export const imageGenerationValidator = vine.compile(
  vine.object({
    modelImageBase64: vine.string().minLength(1),
    mimeType: vine.string().optional(),
    garmentTopImageBase64: vine.string().optional(),
    garmentBottomImageBase64: vine.string().optional(),
    garmentFullBodyImageBase64: vine.string().optional(),
  })
)
