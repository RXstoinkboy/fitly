import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import User from '#models/user'
import { revenuecatService } from '#services/revenuecat_service'

export type ReconciliationResult = {
  userId: string
  status: 'synced' | 'unchanged' | 'error'
  previousStatus: string | null
  newStatus: string | null
}

class SubscriptionReconciliationService {
  async reconcileUser(userId: string): Promise<ReconciliationResult> {
    const user = await User.find(userId)
    if (!user || !user.revenuecatUserId) {
      return {
        userId,
        status: 'error',
        previousStatus: null,
        newStatus: null,
      }
    }

    const subscriber = await revenuecatService.getSubscriber(user.revenuecatUserId)
    if (!subscriber) {
      return {
        userId,
        status: 'error',
        previousStatus: user.subscriptionStatus,
        newStatus: user.subscriptionStatus,
      }
    }

    const isActive = revenuecatService.isEntitlementActive(subscriber)
    const previousStatus = user.subscriptionStatus
    const newStatus = isActive ? 'active' : 'expired'

    if (previousStatus === newStatus) {
      return {
        userId,
        status: 'unchanged',
        previousStatus,
        newStatus,
      }
    }

    user.subscriptionStatus = newStatus
    user.subscriptionUpdatedAt = DateTime.now()
    await user.save()

    logger.info({ userId, previousStatus, newStatus }, 'Subscription reconciled with RevenueCat')

    return {
      userId,
      status: 'synced',
      previousStatus,
      newStatus,
    }
  }
}

export const subscriptionReconciliationService = new SubscriptionReconciliationService()
