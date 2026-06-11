import vine from '@vinejs/vine'

// TODO: Explore tRPC or gRPC to achieve full end-to-end type safety between
//       the Expo mobile client and this AdonisJS backend, if compatible with
//       the Expo runtime and networking layer.

// TODO: Add cross-field validation so at least one garment field
//       (garmentTopImageBase64, garmentBottomImageBase64, garmentFullBodyImageBase64)
//       is required. VineJS does not currently offer a built-in "any of" constraint
//       for optional fields; a custom rule or controller-level check is needed.
//       The controller currently handles this case with a 400 response.

export const imageGenerationValidator = vine.compile(
  vine.object({
    modelImageBase64: vine.string().minLength(1),
    mimeType: vine.string().optional(),
    garmentTopImageBase64: vine.string().optional(),
    garmentBottomImageBase64: vine.string().optional(),
    garmentFullBodyImageBase64: vine.string().optional(),
    garmentOuterwearImageBase64: vine.string().optional(),
  }),
)
