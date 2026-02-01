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
}

export interface CrawlParams {
  city: string;
  budget: number;
  startTime: string; // "09:00 AM"
  endTime: string; // "05:00 PM"
  dietary: string[];
}

export interface Crawl {
  stops: Stop[];
  totalCost: number;
  totalTime: number;
  route: string;
}