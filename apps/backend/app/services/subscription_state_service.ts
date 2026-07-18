import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import User from '#models/user'

export type WebhookEvent = {
  id: string
  type: string
  app_user_id?: string | null
  original_app_user_id?: string | null
  product_id?: string | null
  period_type?: 'TRIAL' | 'NORMAL' | 'INTRO' | null
  purchased_at_ms?: number | null
  expiration_at_ms?: number | null
  environment?: string | null
}

class SubscriptionStateService {
  async applyWebhookEvent(event: WebhookEvent): Promise<void> {
    const appUserId = event.app_user_id ?? event.original_app_user_id
    if (!appUserId) {
      logger.warn({ eventId: event.id, type: event.type }, 'Webhook event missing app_user_id')
      return
    }

    const user = await User.findBy('revenuecat_user_id', appUserId)
    if (!user) {
      logger.warn(
        { eventId: event.id, type: event.type, appUserId },
        'Webhook event: user not found by revenuecat_user_id',
      )
      return
    }

    switch (event.type) {
      case 'INITIAL_PURCHASE':
        await this.handleInitialPurchase(user, event)
        break
      case 'TRIAL_STARTED':
        await this.setSubscription(user, 'trial', 'trial', event)
        break
      case 'TRIAL_CONVERTED':
      case 'RENEWAL':
        await this.setSubscription(user, 'active', 'normal', event)
        break
      case 'CANCELLATION':
        await this.setSubscription(
          user,
          'cancelled',
          user.subscriptionPeriodType ?? 'normal',
          event,
        )
        break
      case 'EXPIRATION':
        await this.setSubscription(user, 'expired', user.subscriptionPeriodType ?? 'normal', event)
        break
      case 'BILLING_ISSUE':
        await this.setSubscription(
          user,
          'billing_issue',
          user.subscriptionPeriodType ?? 'normal',
          event,
        )
        break
      default:
        logger.warn({ eventId: event.id, type: event.type }, 'Unhandled webhook event type')
        return
    }

    user.subscriptionUpdatedAt = DateTime.now()
    await user.save()
  }

  private async handleInitialPurchase(user: User, event: WebhookEvent): Promise<void> {
    if (event.period_type === 'TRIAL') {
      await this.setSubscription(user, 'trial', 'trial', event)
    } else {
      await this.setSubscription(user, 'active', 'normal', event)
    }
  }

  private async setSubscription(
    user: User,
    status: string,
    periodType: string,
    event: WebhookEvent,
  ): Promise<void> {
    user.subscriptionStatus = status
    user.subscriptionPeriodType = periodType
    if (event.purchased_at_ms !== null && event.purchased_at_ms !== undefined) {
      user.subscriptionCurrentPeriodStart = DateTime.fromMillis(event.purchased_at_ms)
    }
    if (event.expiration_at_ms !== null && event.expiration_at_ms !== undefined) {
      user.subscriptionCurrentPeriodEnd = DateTime.fromMillis(event.expiration_at_ms)
    }
    if (status === 'trial') {
      user.trialGenerationsUsed = 0
    }
  }
}

export const subscriptionStateService = new SubscriptionStateService()
