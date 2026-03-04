import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import db from '@adonisjs/lucid/services/db'

const ImageGenerationController = () => import('#controllers/image_generation_controller')

const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.post('/images/generate', [ImageGenerationController, 'generate']).use(middleware.auth())

    router.post('/auth/anonymous', [AuthController, 'anonymous'])

    router.get('/health', async ({ response }) => {
      try {
        await db.rawQuery('SELECT 1')
        return response.json({ status: 'ok', db: 'ok' })
      } catch (error) {
        return response.status(503).json({ status: 'error', db: 'error' })
      }
    })
  })
  .prefix('/api/v1')
