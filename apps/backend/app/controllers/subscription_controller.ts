import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import UsageGeneration from '#models/usage_generation'
import { subscriptionReconciliationService } from '#services/subscription_reconciliation_service'

const MONTHLY_GENERATION_LIMIT = 200

export default class SubscriptionController {
  async show({ currentUser, response }: HttpContext) {
    const status = currentUser.subscriptionStatus ?? 'none'
    const periodType = currentUser.subscriptionPeriodType ?? null
    const isSubscribed = status === 'active'

    const currentPeriodEnd = currentUser.subscriptionCurrentPeriodEnd
      ? currentUser.subscriptionCurrentPeriodEnd.toISO()
      : null

    const monthStart = DateTime.now().startOf('month')
    const usage = await UsageGeneration.query()
      .where('userId', currentUser.id)
      .where('month', monthStart.toISODate()!)
      .first()

    const monthlyGenerationsUsed = usage?.count ?? 0

    return response.json({
      status,
      periodType,
      isSubscribed,
      currentPeriodEnd,
      trialGenerationsUsed: currentUser.trialGenerationsUsed ?? 0,
      trialGenerationsLimit: currentUser.trialGenerationsLimit ?? 20,
      monthlyGenerationsUsed,
      monthlyGenerationsLimit: MONTHLY_GENERATION_LIMIT,
    })
  }

  async sync({ params, response }: HttpContext) {
    const targetUserId = params.userId
    if (!targetUserId || typeof targetUserId !== 'string') {
      return response.badRequest({ error: 'userId parameter required' })
    }

    const result = await subscriptionReconciliationService.reconcileUser(targetUserId)

    if (result.status === 'error') {
      return response.status(404).json({
        error: 'Cannot reconcile user',
        details: 'User not found or has no revenuecat_user_id',
      })
    }

    return response.json(result)
  }
}
