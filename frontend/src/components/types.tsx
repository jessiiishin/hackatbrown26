export interface Stop {
  id: string;
  name: string;
  type: 'restaurant' | 'landmark';
  cuisine?: string;
  description: string;
  price: number;
  duration: number;
  address: string;
  dietaryOptions: string[];
  image: string;
  openTime: string; // "09:00"
  closeTime: string; // "22:00"
  lat?: number;
  lng?: number;
  /** Price tier for display ($, $$, $$$); set when from API or mock crawl */
  priceTier?: BudgetTier;
  /** Walking minutes to next stop (from Routes/Distance Matrix API); only on itinerary from backend */
  walkingMinutesToNext?: number;
}

export type BudgetTier = '$' | '$$' | '$$$';

export interface CrawlParams {
  city: string;
  budget: BudgetTier;
  startTime: string; // "09:00 AM"
  endTime: string; // "05:00 PM"
}

export interface Crawl {
  stops: Stop[];
  totalCost: number;
  totalTime: number;
  route: string;
  /** Budget tier selected when generating (used for price range display). */
  budgetTier?: BudgetTier;
}