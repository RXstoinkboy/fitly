# TODO: Migrate usage limit from Option A to Option C

## Current approach (Option A)

The monthly generation limit (200/image/month) is enforced client-side via the `x-is-subscribed` header. The mobile app reads its RevenueCat subscription status and sends it to the backend.

**Vulnerability**: Any client can set `x-is-subscribed: true` to bypass the limit. The backend trusts this header without verification.

## Target approach (Option C) — Server-side RevenueCat verification

The backend verifies the subscription directly with RevenueCat's REST API on every generation request, removing all client trust.

### What needs to change

#### 1. Backend env vars
Add to `start/env.ts`:
```
REVENUECAT_API_KEY: Env.schema.string()
REVENUECAT_ENTITLEMENT_ID: Env.schema.string.optional()
```
(Default entitlement: `virtual_try_on_pro`)

#### 2. Backend: RevenueCat verification service
Create `app/services/revenuecat_service.ts` that:
- Takes a user's RevenueCat `originalAppUserId` (from the request or stored on the user record)
- Calls `GET https://api.revenuecat.com/v1/subscribers/{appUserId}` with the RevenueCat API key (Bearer auth)
- Parses the response to check if `subscriber.entitlements.{entitlementId}.is_active` is `true`
- Returns `{ isSubscribed: boolean }`

RevenueCat REST API docs: https://www.revenuecat.com/reference/get-subscriber-information

#### 3. Backend: Link RevenueCat user to backend user
Two sub-options:

**Option C1 (recommended)**: Add `revenuecat_user_id` column to `users` table.
- The mobile client sends `x-revenuecat-user-id` header on each request
- Backend stores it on the user record (first time seen) and uses it to verify subscription
- Simpler than webhooks, no external endpoint needed

**Option C2 (most secure)**: RevenueCat webhooks
- Create `POST /api/v1/webhooks/revenuecat` endpoint
- Configure RevenueCat dashboard to send webhook events
- Update user's `is_subscribed` status in DB when webhook fires
- Pros: no per-request latency, no REST API rate limits
- Cons: needs public HTTPS endpoint, more complex setup

#### 4. Backend: Replace header check in controller
In `ImageGenerationController.generate()`:
```typescript
// Current (Option A):
const isSubscribed = request.header('x-is-subscribed') === 'true'

// Future (Option C):
const revenuecatUserId = currentUser.revenuecatUserId
  ?? request.header('x-revenuecat-user-id')
const isSubscribed = revenuecatUserId
  ? await revenuecatService.checkSubscription(revenuecatUserId)
  : false
```

#### 5. Backend: Remove `x-is-subscribed` handling
Delete the `x-is-subscribed` header check from the controller once Option C is live.

#### 6. Mobile: Send RevenueCat user ID
In `api.ts` (or `backend-headers.ts`), send `x-revenuecat-user-id` header:
```typescript
import { fetchCustomerInfo } from '@/lib/subscription';
const customerInfo = await fetchCustomerInfo();
headers['x-revenuecat-user-id'] = customerInfo.originalAppUserId;
```

#### 7. Mobile: Remove `x-is-subscribed` header
Remove the `x-is-subscribed` header logic from `backend-headers.ts`.

### Migration steps

1. Add `REVENUECAT_API_KEY` env var to backend
2. Create `app/services/revenuecat_service.ts` with verification logic
3. Update controller to use server-side verification
4. Update mobile to send `x-revenuecat-user-id`
5. Test end-to-end: generate image as subscribed user → limit bypassed
6. Clean up: remove `x-is-subscribed` header code
7. Deploy

### RevenueCat REST API reference

```
GET https://api.revenuecat.com/v1/subscribers/{app_user_id}
Authorization: Bearer {secret_api_key}

Response (relevant fields):
{
  "subscriber": {
    "entitlements": {
      "virtual_try_on_pro": {  // or whatever your entitlement ID is
        "is_active": true,
        "expires_date": "2026-07-01T00:00:00Z"
      }
    }
  }
}
```

The secret API key is found in RevenueCat dashboard → Settings → API Keys.
Use the **Secret Key** (not the public one).

### Rate limiting

RevenueCat REST API has rate limits (typically 1000 req/min). This is fine for per-request checks at MVP scale but may need caching for larger volumes. Consider:
- Cache subscription status for 5-15 minutes per user
- Use RevenueCat webhooks (Option C2) to push updates instead of polling