import type { BudgetTier } from "../components/types";

/** Price tier display per guide: short per-meal label and min/max for scaling total range. */
export const PRICE_TIER_RANGE_DISPLAY: Record<
  BudgetTier,
  { label: string; minPerStop: number; maxPerStop: number | null }
> = {
  $: {
    label: 'About $10 and under',
    minPerStop: 0,
    maxPerStop: 10,
  },
  $$: {
    label: 'About $10–$25',
    minPerStop: 10,
    maxPerStop: 25,
  },
  $$$: {
    label: 'About $25–$45',
    minPerStop: 25,
    maxPerStop: 45,
  },
  $$$$: {
    label: 'About $50 and up',
    minPerStop: 50,
    maxPerStop: null,
  },
};

/** Format total price range for display based on tier and number of stops. */
export function formatCrawlPriceRange(
  budgetTier: BudgetTier,
  numStops: number
): string {
  const { minPerStop, maxPerStop } = PRICE_TIER_RANGE_DISPLAY[budgetTier];
  const restaurantCount = numStops;
  if (maxPerStop == null) {
    return `$${minPerStop * restaurantCount}+`;
  }
  if (minPerStop === 0) {
    return `Up to $${maxPerStop * restaurantCount}`;
  }
  return `$${minPerStop * restaurantCount}–$${maxPerStop * restaurantCount}`;
}

/** Upper value of the total range for display (e.g. "Food Funds: $125"). */
export function getTotalRangeUpper(
  budgetTier: BudgetTier,
  numStops: number
): string {
  const { minPerStop, maxPerStop } = PRICE_TIER_RANGE_DISPLAY[budgetTier];
  const n = numStops;
  if (maxPerStop == null) {
    return `$${minPerStop * n}+`;
  }
  return `$${maxPerStop * n}`;
}

export const BUDGET_TIERS: BudgetTier[] = ['$', '$$', '$$$', '$$$$'];