import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ImageGenerationController = () =>
  import('#controllers/image_generation_controller')

router.post('/api/generate-image', [ImageGenerationController, 'generate']).use(
  middleware.apiKey()
)

router.get('/health', async ({ response }) => {
  return response.json({ status: 'ok' })
})
