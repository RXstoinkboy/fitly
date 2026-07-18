import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

const REVENUECAT_API_BASE = 'https://api.revenuecat.com/v1'

export type RevenueCatEntitlement = {
  product_identifier: string
  purchase_date: string
  expires_date: string | null
  is_active: boolean
  period_type: 'TRIAL' | 'NORMAL' | 'INTRO'
}

export type RevenueCatSubscriber = {
  subscriber: {
    original_app_user_id: string
    subscriptions: Record<
      string,
      {
        product_id: string
        is_active: boolean
        period_type: 'TRIAL' | 'NORMAL' | 'INTRO'
        expires_date: string | null
        purchase_date: string
      }
    >
    entitlements: Record<string, RevenueCatEntitlement>
  }
}

class RevenueCatService {
  verifyWebhookSignature(providedSecret: string | null | undefined): boolean {
    const expected = `Bearer ${env.get('REVENUECAT_WEBHOOK_SECRET')}`
    if (!expected || !providedSecret) return false
    return providedSecret === expected
  }

  async getSubscriber(appUserId: string): Promise<RevenueCatSubscriber | null> {
    const apiKey = env.get('REVENUECAT_API_KEY')
    if (!apiKey) {
      logger.warn('REVENUECAT_API_KEY not configured — getSubscriber skipped')
      return null
    }

    const url = `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Platform': 'android',
      },
    })

    if (!res.ok) {
      logger.error({ status: res.status, appUserId }, 'RevenueCat getSubscriber request failed')
      return null
    }

    return (await res.json()) as RevenueCatSubscriber
  }

  isEntitlementActive(subscriber: RevenueCatSubscriber): boolean {
    const entitlementId = env.get('REVENUECAT_ENTITLEMENT_ID')
    if (!entitlementId) return false
    const entitlement = subscriber.subscriber.entitlements[entitlementId]
    return Boolean(entitlement?.is_active)
  }
}

export const revenuecatService = new RevenueCatService()
