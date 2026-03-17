import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import {
  CustomerCenterResult,
  CustomerSnapshot,
  PaywallAttemptResult,
  SubscriptionPlan,
  SubscriptionProductId,
  SubscriptionStatus,
} from './types';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'test_WVmaoikXGmAQKvmFlFfqVWRMNdS';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || 'virtual_try_on_pro';
const OFFERING_ID = process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID || null;

const PLAN_PRODUCT_IDS: Record<SubscriptionProductId, string> = {
  monthly: 'monthly',
  yearly: 'yearly',
};

const isPurchasesModuleReady = () =>
  typeof Purchases?.setLogLevel === 'function' && typeof Purchases?.configure === 'function';

const isPurchasesUiReady = () => typeof RevenueCatUI?.presentPaywall === 'function';

const warnRevenueCatNativeUnavailable = () => {
  console.warn(
    'RevenueCat native module is unavailable. This usually means the app is running in Expo Go or the native app was not rebuilt after installing react-native-purchases.',
  );
};

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

  if (!isPurchasesModuleReady()) {
    warnRevenueCatNativeUnavailable();
    return;
  }

  if (!API_KEY) {
    console.warn(
      'RevenueCat API key is missing. Paywall will not be available until it is provided.',
    );
    return;
  }

  Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({
    apiKey: API_KEY,
    shouldShowInAppMessagesAutomatically: true,
  });
  isConfigured = true;
};

const pickOffering = (offerings: PurchasesOfferings): PurchasesOffering | null => {
  if (OFFERING_ID && offerings.all[OFFERING_ID]) {
    return offerings.all[OFFERING_ID];
  }

  return offerings.current ?? null;
};

const mapCustomerInfo = (customerInfo: CustomerInfo): CustomerSnapshot => {
  const active = Object.values(customerInfo.entitlements.active);
  const latestExpirationDate = active
    .map((entitlement) => entitlement.expirationDate)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    originalAppUserId: customerInfo.originalAppUserId,
    activeEntitlementIds: active.map((entitlement) => entitlement.identifier),
    latestExpirationDate: latestExpirationDate ?? null,
  };
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

const packageToPlan = (pkg: PurchasesPackage): SubscriptionPlan => {
  const maybeKnownPlan = (Object.keys(PLAN_PRODUCT_IDS) as SubscriptionProductId[]).find(
    (planId) => pkg.product.identifier === PLAN_PRODUCT_IDS[planId],
  );

  return {
    id: maybeKnownPlan ?? 'monthly',
    title: pkg.product.title,
    priceString: pkg.product.priceString,
    productIdentifier: pkg.product.identifier,
    packageIdentifier: pkg.identifier,
  };
};

const findPackageForProduct = (
  offering: PurchasesOffering,
  productId: SubscriptionProductId,
): PurchasesPackage | null => {
  const expectedIdentifier = PLAN_PRODUCT_IDS[productId];
  return (
    offering.availablePackages.find((pkg) => pkg.product.identifier === expectedIdentifier) ?? null
  );
};

export const setRevenueCatAppUser = async (appUserId: string | null) => {
  await configureRevenueCat();

  if (!isPurchasesModuleReady()) {
    return;
  }

  if (!appUserId) {
    await Purchases.logOut();
    return;
  }

  await Purchases.logIn(appUserId);
};

export const fetchCustomerInfo = async (): Promise<CustomerSnapshot> => {
  await configureRevenueCat();

  if (!isPurchasesModuleReady()) {
    return {
      originalAppUserId: 'unknown',
      activeEntitlementIds: [],
      latestExpirationDate: null,
    };
  }

  const customerInfo = await Purchases.getCustomerInfo();
  return mapCustomerInfo(customerInfo);
};

export const addCustomerInfoListener = (
  callback: (customerInfo: CustomerSnapshot) => void,
): (() => void) => {
  if (!isPurchasesModuleReady()) {
    warnRevenueCatNativeUnavailable();
    return () => undefined;
  }

  const listener = (customerInfo: CustomerInfo) => {
    callback(mapCustomerInfo(customerInfo));
  };

  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
};

export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  await configureRevenueCat();

  if (!isPurchasesModuleReady()) {
    return [];
  }

  const offering = await fetchOffering();
  if (!offering) {
    return [];
  }

  return offering.availablePackages.map(packageToPlan);
};

export const purchaseSubscriptionPlan = async (
  productId: SubscriptionProductId,
): Promise<SubscriptionStatus> => {
  await configureRevenueCat();

  if (!isPurchasesModuleReady()) {
    throw new Error(
      'RevenueCat native module is unavailable. Build and run a development client instead of Expo Go.',
    );
  }

  const offering = await fetchOffering();

  if (!offering) {
    throw new Error('No RevenueCat offering available.');
  }

  const packageToPurchase = findPackageForProduct(offering, productId);
  if (!packageToPurchase) {
    throw new Error(`Product \"${productId}\" is not configured in the selected offering.`);
  }

  const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
  return buildStatusFromCustomer(customerInfo);
};

export const restoreSubscriptionPurchases = async (): Promise<SubscriptionStatus> => {
  await configureRevenueCat();

  if (!isPurchasesModuleReady()) {
    return getFallbackStatus('error');
  }

  const customerInfo = await Purchases.restorePurchases();
  return buildStatusFromCustomer(customerInfo);
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

export const presentRevenueCatCustomerCenter = async (): Promise<CustomerCenterResult> => {
  await configureRevenueCat();

  if (!isPurchasesModuleReady()) {
    return { opened: false, source: 'none' };
  }

  const customerCenterApi = RevenueCatUI as unknown as {
    presentCustomerCenter?: () => Promise<unknown>;
  };

  if (typeof customerCenterApi.presentCustomerCenter === 'function') {
    await customerCenterApi.presentCustomerCenter();
    return { opened: true, source: 'customer-center' };
  }

  await Purchases.showManageSubscriptions();
  return { opened: true, source: 'store-management' };
};

export const presentRevenueCatPaywall = async (): Promise<PaywallAttemptResult> => {
  try {
    await configureRevenueCat();

    if (!isPurchasesModuleReady() || !isPurchasesUiReady()) {
      warnRevenueCatNativeUnavailable();
      return { paywallResult: PAYWALL_RESULT.ERROR, status: getFallbackStatus('error') };
    }

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

    if (!isPurchasesModuleReady() || !isPurchasesUiReady()) {
      warnRevenueCatNativeUnavailable();
      return { paywallResult: PAYWALL_RESULT.ERROR, status: getFallbackStatus('error') };
    }

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
