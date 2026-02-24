import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ImageGenerationController = () => import('#controllers/image_generation_controller')

const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router
      .post('/images/generate', [ImageGenerationController, 'generate'])
      .use(middleware.apiKey())

    router.post('/auth/anonymous', [AuthController, 'anonymous'])

    router.get('/health', async ({ response }) => {
      return response.json({ status: 'ok' })
    })
  })
  .prefix('/api/v1')
