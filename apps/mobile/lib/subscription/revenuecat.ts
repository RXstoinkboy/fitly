import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOfferings } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { PaywallAttemptResult, SubscriptionStatus } from './types';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'rc_api_key_placeholder';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || 'pro';
const OFFERING_ID = process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID || null;

const getFallbackStatus = (reason: SubscriptionStatus['reason']): SubscriptionStatus => ({
  isSubscribed: false,
  activeEntitlementId: null,
  expirationDate: null,
  lastCheckedAt: new Date().toISOString(),
  reason,
});

export const defaultSubscriptionStatus = getFallbackStatus('unknown');

let isConfigured = false;

export const configureRevenueCat = async () => {
  if (isConfigured) return;

  if (!API_KEY) {
    console.warn('RevenueCat API key is missing. Paywall will not be available until it is provided.');
    return;
  }

  Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({
    apiKey: API_KEY,
    shouldShowInAppMessagesAutomatically: true,
  });
  isConfigured = true;
};

const pickOffering = (offerings: PurchasesOfferings) => {
  if (OFFERING_ID && offerings.all[OFFERING_ID]) {
    return offerings.all[OFFERING_ID];
  }

  return offerings.current;
};

const buildStatusFromCustomer = (customerInfo: CustomerInfo): SubscriptionStatus => {
  const explicitEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  const firstActive = explicitEntitlement ?? Object.values(customerInfo.entitlements.active)[0];

  return {
    isSubscribed: Boolean(firstActive),
    activeEntitlementId: firstActive?.identifier ?? null,
    expirationDate: firstActive?.expirationDate ?? null,
    lastCheckedAt: new Date().toISOString(),
    reason: firstActive ? 'active' : 'inactive',
  };
};

const fetchOffering = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return pickOffering(offerings);
  } catch (error) {
    console.warn('Failed to load RevenueCat offerings', error);
    return null;
  }
};

export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    await configureRevenueCat();
    const customerInfo = await Purchases.getCustomerInfo();
    return buildStatusFromCustomer(customerInfo);
  } catch (error) {
    console.warn('Failed to check subscription status', error);
    return getFallbackStatus('error');
  }
};

export const presentRevenueCatPaywall = async (): Promise<PaywallAttemptResult> => {
  try {
    await configureRevenueCat();
    const offering = await fetchOffering();
    const paywallResult = await RevenueCatUI.presentPaywall({
      offering: offering ?? undefined,
    });
    const status = await fetchSubscriptionStatus();
    return { paywallResult, status };
  } catch (error) {
    console.warn('Failed to present RevenueCat paywall', error);
    return { paywallResult: PAYWALL_RESULT.ERROR, status: getFallbackStatus('error') };
  }
};

export const presentRevenueCatPaywallIfNeeded = async (): Promise<PaywallAttemptResult> => {
  try {
    await configureRevenueCat();
    const offering = await fetchOffering();
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
      offering: offering ?? undefined,
    });
    const status = await fetchSubscriptionStatus();
    return { paywallResult, status };
  } catch (error) {
    console.warn('Failed to present conditional RevenueCat paywall', error);
    return { paywallResult: PAYWALL_RESULT.ERROR, status: getFallbackStatus('error') };
  }
};

export const SUBSCRIPTION_ENTITLEMENT_ID = ENTITLEMENT_ID;
