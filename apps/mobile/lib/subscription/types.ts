import { PAYWALL_RESULT } from 'react-native-purchases-ui';

export type SubscriptionStatusReason = 'active' | 'inactive' | 'expired' | 'error' | 'unknown';

export type SubscriptionStatus = {
  isSubscribed: boolean;
  activeEntitlementId: string | null;
  expirationDate: string | null;
  lastCheckedAt: string;
  reason: SubscriptionStatusReason;
};

export type PaywallAttemptResult = {
  paywallResult: PAYWALL_RESULT;
  status: SubscriptionStatus;
};

export type SubscriptionProductId = 'monthly' | 'yearly';

export type SubscriptionPlan = {
  id: SubscriptionProductId;
  title: string;
  priceString: string;
  productIdentifier: string;
  packageIdentifier: string;
};

export type CustomerSnapshot = {
  originalAppUserId: string;
  activeEntitlementIds: string[];
  latestExpirationDate: string | null;
};

export type CustomerCenterResult = {
  opened: boolean;
  source: 'customer-center' | 'store-management' | 'none';
};
