import type { BudgetTier } from "../components/types";

/** Price tier display per guide: label and per-stop min/max for scaling total range. */
export const PRICE_TIER_RANGE_DISPLAY: Record<
  BudgetTier,
  { label: string; minPerStop: number; maxPerStop: number | null }
> = {
  $: {
    label: 'Usually $10 and under',
    minPerStop: 0,
    maxPerStop: 10,
  },
  $$: {
    label: '$10–$25',
    minPerStop: 10,
    maxPerStop: 25,
  },
  $$$: {
    label: '$25–$45',
    minPerStop: 25,
    maxPerStop: 45,
  },
  $$$$: {
    label: '$50 and up',
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
  const restaurantCount = numStops; // all stops are restaurants in current flow
  if (maxPerStop == null) {
    return `$${minPerStop * restaurantCount}+`;
  }
  if (minPerStop === 0) {
    return `Up to $${maxPerStop * restaurantCount}`;
  }
  return `$${minPerStop * restaurantCount}–$${maxPerStop * restaurantCount}`;
}

export const BUDGET_TIERS: BudgetTier[] = ['$', '$$', '$$$', '$$$$'];