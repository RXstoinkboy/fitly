type EventNameParts = (string | number | undefined | null)[];

const buildEventName = (...parts: EventNameParts) => parts.filter(Boolean).join(':');

export const analyticsEvents = {
  app: {
    launched: () => buildEventName('app', 'launched'),
  },
  onboarding: {
    stepViewed: () => buildEventName('onboarding', 'step_viewed'),
    started: () => buildEventName('onboarding', 'started'),
    completed: () => buildEventName('onboarding', 'completed'),
    action: (name: string) => buildEventName('onboarding', 'action', name),
  },
  photos: {
    added: (subject: 'model' | 'garment', source: string) =>
      buildEventName('photo', subject, 'added', source),
  },
  garments: {
    added: (type: string) => buildEventName('garment', 'added', type),
    removed: (type: string) => buildEventName('garment', 'removed', type),
  },
  generation: {
    requested: (context: string) => buildEventName('generation', 'requested', context),
    succeeded: (context: string) => buildEventName('generation', 'succeeded', context),
    failed: (context: string) => buildEventName('generation', 'failed', context),
  },
  image: {
    deleted: (type: string) => buildEventName('image', 'deleted', type),
  },
  gallery: {
    openedItem: (type: string) => buildEventName('gallery', 'opened_item', type),
    filterChanged: () => buildEventName('gallery', 'filter_changed'),
  },
  paywall: {
    shown: (context: string) => buildEventName('paywall', 'shown', context),
    result: (context: string, result: string) =>
      buildEventName('paywall', 'result', context, result),
    requirementOutcome: (context: string, outcome: 'allowed' | 'blocked') =>
      buildEventName('paywall', 'requirement', context, outcome),
    customerCenterOpened: (context: string) =>
      buildEventName('paywall', 'customer_center_opened', context),
  },
  errors: {
    captured: () => buildEventName('error', 'captured'),
    unhandled: () => buildEventName('error', 'unhandled'),
    promiseRejection: () => buildEventName('error', 'unhandled_promise'),
  },
};
