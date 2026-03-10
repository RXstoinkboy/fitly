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
