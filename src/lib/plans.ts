export const PLANS = {
  free: { status: 1, price: 0, linksLimit: 1, clicksLimit: 30, analytics: false },
  standard: { status: 2, price: 9, linksLimit: 5, clicksLimit: 350, analytics: false },
  advanced: { status: 3, price: 19, linksLimit: 20, clicksLimit: 1250, analytics: true },
  unlimited: { status: 4, price: 59, linksLimit: -1, clicksLimit: -1, analytics: true },
} as const;

export type PlanCode = keyof typeof PLANS;
