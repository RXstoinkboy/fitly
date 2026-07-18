import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import ProcessedWebhookEvent from '#models/processed_webhook_event'
import { revenuecatService } from '#services/revenuecat_service'
import { subscriptionStateService, type WebhookEvent } from '#services/subscription_state_service'

export default class RevenueCatWebhooksController {
  async handle({ request, response }: HttpContext): Promise<void> {
    const authHeader = request.header('authorization')

    if (!revenuecatService.verifyWebhookSignature(authHeader)) {
      logger.warn('RevenueCat webhook: unauthorized (secret mismatch)')
      response.unauthorized()
      return
    }

    const body = request.body()
    const event: WebhookEvent | undefined = body?.event
    if (!event || typeof event !== 'object') {
      logger.warn('RevenueCat webhook: missing event object')
      response.badRequest({ error: 'Missing event object' })
      return
    }
    if (!event.id) {
      logger.warn({ type: event.type }, 'RevenueCat webhook: missing event.id')
      response.badRequest({ error: 'Missing event.id' })
      return
    }
    if (!event.type) {
      logger.warn({ eventId: event.id }, 'RevenueCat webhook: missing event.type')
      response.badRequest({ error: 'Missing event.type' })
      return
    }

    const existing = await ProcessedWebhookEvent.find(event.id)
    if (existing) {
      response.ok({ received: true, duplicate: true })
      return
    }

    try {
      await subscriptionStateService.applyWebhookEvent(event)
    } catch (err) {
      logger.error(
        {
          eventId: event.id,
          type: event.type,
          err: err instanceof Error ? err.message : String(err),
        },
        'RevenueCat webhook: processing failed',
      )
      throw err
    }

    try {
      await ProcessedWebhookEvent.create({
        eventId: event.id,
        eventType: event.type,
        appUserId: event.app_user_id ?? event.original_app_user_id ?? null,
      })
    } catch (err) {
      logger.warn(
        { eventId: event.id, err: err instanceof Error ? err.message : String(err) },
        'RevenueCat webhook: idempotency record write failed (duplicate on retry is acceptable)',
      )
    }

    response.ok({ received: true })
  }
}
