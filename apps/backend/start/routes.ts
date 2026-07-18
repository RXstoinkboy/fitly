import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import db from '@adonisjs/lucid/services/db'

const ImageGenerationController = () => import('#controllers/image_generation_controller')

const AuthController = () => import('#controllers/auth_controller')

const RevenueCatWebhooksController = () => import('#controllers/revenuecat_webhooks_controller')

const SubscriptionController = () => import('#controllers/subscription_controller')

router
  .group(() => {
    router
      .post('/images/generate', [ImageGenerationController, 'generate'])
      .use([middleware.installationId(), middleware.auth()])

    router
      .get('/subscription/status', [SubscriptionController, 'show'])
      .use([middleware.installationId(), middleware.auth()])

    router.post('/auth/anonymous', [AuthController, 'anonymous']).use(middleware.installationId())

    router.post('/webhooks/revenuecat', [RevenueCatWebhooksController, 'handle'])

    router
      .post('/admin/sync-subscription/:userId', [SubscriptionController, 'sync'])
      .use([middleware.installationId(), middleware.apiKey()])

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
