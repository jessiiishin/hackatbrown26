import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodCrawlForm } from './components/FoodCrawlForm';
import { CrawlItinerary } from './components/CrawlItinerary';
import { SetupInstructions } from './components/SetupInstructions';
import { LoadingScreen } from './components/LoadingScreen';

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
  /** Price tier for display ($, $$, $$$, $$$$); set when from API or mock crawl */
  priceTier?: BudgetTier;
}

export type BudgetTier = '$' | '$$' | '$$$' | '$$$$';

export interface CrawlParams {
  city: string;
  budgetTier: BudgetTier;
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [crawl, setCrawl] = useState<Crawl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateCrawl = async (params: CrawlParams) => {
    setCrawl(null);
    setCrawlError(null);
    setIsGenerating(true);
    try {
      const url = `${API_BASE}/places/restaurants?city=${encodeURIComponent(params.city)}&budgetTier=${encodeURIComponent(params.budgetTier)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Request failed (${res.status})`);
      }
      const data = await res.json();
      const stops = mapApiRestaurantsToStops(data.restaurants || [], params);
      if (stops.length === 0) {
        setCrawlError('No restaurants found. Try a different city or budget tier.');
        return;
      }
      const totalCost = stops.reduce((sum, s) => sum + s.price, 0);
      const totalTime = stops.reduce((sum, s) => sum + s.duration, 0);
      setCrawl({
        stops,
        totalCost,
        totalTime,
        route: generateRoute(stops),
      });
    } catch (err) {
      setCrawlError(err instanceof Error ? err.message : 'Failed to load restaurants.');
      // Fallback to mock data
      const generatedCrawl = generateCrawl(params);
      setCrawl(generatedCrawl);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setCrawl(null);
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#FDF8EF' }}>
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isLoading ? 0 : 1,
          y: isLoading ? 20 : 0
        }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="h-[2px] w-12 bg-[#F59F00]" />
            <span className="uppercase tracking-[0.3em] text-xs font-bold text-[#F59F00]">The Culinary Journal</span>
            <div className="h-[2px] w-12 bg-[#F59F00]" />
          </div>
          <h1 className="text-7xl font-bold tracking-tighter" style={{ color: '#242116', fontFamily: 'Parkinsans' }}>
            Munchy
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-80" style={{ color: '#242116' }}>
            Curating personalized food crawls, one chapter at a time.
          </p>
        </header>

        {!crawl && <div className="mb-12"><SetupInstructions /></div>}

        <div className="relative">
          {isGenerating && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#FDF8EF]/90 rounded-2xl min-h-[400px]">
              <div className="text-center">
                <div className="inline-block w-10 h-10 border-4 border-[#F59F00] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium" style={{ color: '#242116' }}>Finding restaurants...</p>
              </div>
            </div>
          )}
          {crawlError && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              {crawlError}
            </div>
          )}
          {!crawl ? (
            <FoodCrawlForm onGenerate={handleGenerateCrawl} disabled={isGenerating} />
          ) : (
            <CrawlItinerary crawl={crawl} onReset={handleReset} />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Food crawl generation algorithm
function generateCrawl(params: CrawlParams): Crawl {
  const cityData = getCityData(params.city);
  
  const startMinutes = timeToMinutes(params.startTime);
  const endMinutes = timeToMinutes(params.endTime);
  const totalAvailableTime = endMinutes > startMinutes ? endMinutes - startMinutes : (1440 - startMinutes) + endMinutes;

  const availableStops = filterStops(cityData, params);
  const selectedStops = selectOptimalStops(availableStops, params, totalAvailableTime);
  
  const totalCost = selectedStops.reduce((sum, stop) => 
    stop.type === 'restaurant' ? sum + stop.price : sum, 0
  );
  const totalTime = selectedStops.reduce((sum, stop) => sum + stop.duration, 0);

  const stopsWithTier = selectedStops.map((s) => ({
    ...s,
    priceTier: s.type === 'restaurant' ? params.budgetTier : undefined,
  }));

  return {
    stops: stopsWithTier,
    totalCost,
    totalTime,
    route: generateRoute(stopsWithTier),
  };
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + (minutes || 0);
}

function h24ToMinutes(h24Str: string): number {
  const [hours, minutes] = h24Str.split(':').map(Number);
  return hours * 60 + minutes;
}

function isStopOpen(stop: Stop, windowStart: number, windowEnd: number): boolean {
  const stopOpen = h24ToMinutes(stop.openTime);
  const stopClose = h24ToMinutes(stop.closeTime);
  
  const checkTimeInRange = (time: number, start: number, end: number) => {
    if (start <= end) {
      return time >= start && time <= end;
    } else {
      // Overnight (e.g., 22:00 to 04:00)
      return time >= start || time <= end;
    }
  };

  return checkTimeInRange(windowStart, stopOpen, stopClose) || 
         checkTimeInRange(windowEnd, stopOpen, stopClose) ||
         checkTimeInRange(stopOpen, windowStart, windowEnd);
}

function filterStops(stops: Stop[], params: CrawlParams): Stop[] {
  const windowStart = timeToMinutes(params.startTime);
  const windowEnd = timeToMinutes(params.endTime);
  const [minPrice, maxPrice] = PRICE_TIER_RANGE[params.budgetTier];

  return stops.filter(stop => {
    if (!isStopOpen(stop, windowStart, windowEnd)) return false;

    if (stop.type === 'landmark') return true;

    // Only include restaurants in the user's selected price tier
    if (stop.price < minPrice || stop.price > maxPrice) return false;

    if (params.dietary.length > 0) {
      return params.dietary.some(diet => stop.dietaryOptions.includes(diet));
    }

    return true;
  });
}

const BUDGET_TIER_MAX: Record<BudgetTier, number> = {
  '$': 15,
  '$$': 40,
  '$$$': 80,
  '$$$$': 200,
};

/** Price range per tier for filtering mock restaurants (inclusive) */
const PRICE_TIER_RANGE: Record<BudgetTier, [number, number]> = {
  '$': [0, 15],
  '$$': [16, 40],
  '$$$': [41, 80],
  '$$$$': [81, 250],
};

function selectOptimalStops(stops: Stop[], params: CrawlParams, availableTime: number): Stop[] {
  const budgetMax = BUDGET_TIER_MAX[params.budgetTier];
  const restaurants = stops.filter(s => s.type === 'restaurant');
  const landmarks = stops.filter(s => s.type['includes']('landmark')); // using includes for safety
  
  const selected: Stop[] = [];
  let currentCost = 0;
  let currentTimeUsed = 0;
  
  let restaurantIndex = 0;
  let landmarkIndex = 0;
  let addRestaurant = true;
  
  while (currentTimeUsed < availableTime) {
    if (addRestaurant && restaurantIndex < restaurants.length) {
      const restaurant = restaurants[restaurantIndex];
      if (currentCost + restaurant.price <= budgetMax && 
          currentTimeUsed + restaurant.duration <= availableTime) {
        selected.push(restaurant);
        currentCost += restaurant.price;
        currentTimeUsed += restaurant.duration;
        restaurantIndex++;
      } else {
        restaurantIndex++;
      }
    } else if (!addRestaurant && landmarkIndex < landmarks.length) {
      const landmark = landmarks[landmarkIndex];
      if (currentTimeUsed + landmark.duration <= availableTime) {
        selected.push(landmark);
        currentTimeUsed += landmark.duration;
        landmarkIndex++;
      } else {
        landmarkIndex++;
      }
    } else {
      if (addRestaurant) restaurantIndex++;
      else landmarkIndex++;
    }
    
    addRestaurant = !addRestaurant;
    
    if (restaurantIndex >= restaurants.length && landmarkIndex >= landmarks.length) {
      break;
    }
  }
  
  return selected.length > 0 ? selected : stops.slice(0, 3);
}

function generateRoute(stops: Stop[]): string {
  return stops.map((stop, index) => {
    if (index === 0) return `Start at ${stop.name}`;
    return `→ ${stop.name}`;
  }).join(' ');
}

/** API restaurant shape from GET /places/restaurants */
interface ApiRestaurant {
  id: string | null;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  priceLevel?: string;
}

const API_PRICE_LEVEL_TO_TIER: Record<string, BudgetTier> = {
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
};

function mapApiRestaurantsToStops(restaurants: ApiRestaurant[], params: CrawlParams): Stop[] {
  const pricePerStop = Math.round(BUDGET_TIER_MAX[params.budgetTier] / 5);
  const placeholderImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

  const matching = restaurants.filter((r) => {
    if (!r.priceLevel) return true;
    const tier = API_PRICE_LEVEL_TO_TIER[r.priceLevel];
    return tier === params.budgetTier;
  });

  return matching.map((r) => ({
    id: r.id || `place-${r.name.replace(/\s/g, '-')}`,
    name: r.name,
    type: 'restaurant' as const,
    description: `${r.name} in ${params.city}`,
    price: pricePerStop,
    duration: 45,
    address: r.address,
    dietaryOptions: params.dietary,
    image: placeholderImage,
    openTime: '09:00',
    closeTime: '22:00',
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    priceTier: params.budgetTier,
  }));
}

function getCityData(city: string): Stop[] {
  const cities: Record<string, Stop[]> = {
    'New York': [
      {
        id: '1',
        name: 'Joe\'s Pizza',
        type: 'restaurant',
        cuisine: 'Italian',
        description: 'Iconic NYC slice joint serving classic New York-style pizza since 1975',
        price: 8,
        duration: 30,
        address: 'Greenwich Village',
        dietaryOptions: ['vegetarian'],
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        openTime: '10:00',
        closeTime: '04:00'
      },
      {
        id: '2',
        name: 'Statue of Liberty',
        type: 'landmark',
        description: 'Iconic symbol of freedom and democracy',
        price: 0,
        duration: 20,
        address: 'Liberty Island',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800',
        openTime: '09:00',
        closeTime: '17:00'
      },
      {
        id: '3',
        name: 'Katz\'s Delicatessen',
        type: 'restaurant',
        cuisine: 'Deli',
        description: 'Famous deli known for pastrami sandwiches and old-school NYC charm',
        price: 22,
        duration: 45,
        address: 'Lower East Side',
        dietaryOptions: ['gluten-free'],
        image: 'https://images.unsplash.com/photo-1619880437374-5dde0d6e01f8?w=800',
        openTime: '08:00',
        closeTime: '23:00'
      },
      {
        id: '4',
        name: 'Central Park',
        type: 'landmark',
        description: 'Urban oasis in the heart of Manhattan',
        price: 0,
        duration: 25,
        address: 'Midtown',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1572347194075-7114f6d19e3d?w=800',
        openTime: '06:00',
        closeTime: '01:00'
      },
      {
        id: '5',
        name: 'Xi\'an Famous Foods',
        type: 'restaurant',
        cuisine: 'Chinese',
        description: 'Hand-pulled noodles and spicy cumin lamb burgers',
        price: 15,
        duration: 35,
        address: 'Chinatown',
        dietaryOptions: ['vegan', 'vegetarian'],
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        openTime: '11:00',
        closeTime: '21:00'
      },
      {
        id: '6',
        name: 'Brooklyn Bridge',
        type: 'landmark',
        description: 'Historic suspension bridge with stunning skyline views',
        price: 0,
        duration: 30,
        address: 'Brooklyn Bridge',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1543716091-a840c05249ec?w=800',
        openTime: '00:00',
        closeTime: '23:59'
      },
      {
        id: '7',
        name: 'Levain Bakery',
        type: 'restaurant',
        cuisine: 'Bakery',
        description: 'World-famous oversized cookies and pastries',
        price: 6,
        duration: 20,
        address: 'Upper West Side',
        dietaryOptions: ['vegetarian'],
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
        openTime: '07:00',
        closeTime: '20:00'
      },
      {
        id: '8',
        name: 'The Halal Guys',
        type: 'restaurant',
        cuisine: 'Middle Eastern',
        description: 'Legendary street food with chicken and rice platters',
        price: 10,
        duration: 25,
        address: 'Midtown',
        dietaryOptions: ['gluten-free', 'halal'],
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
        openTime: '10:00',
        closeTime: '04:00'
      }
    ],
    'San Francisco': [
      {
        id: '9',
        name: 'Tartine Bakery',
        type: 'restaurant',
        cuisine: 'Bakery',
        description: 'Artisanal breads and morning buns that define SF breakfast',
        price: 12,
        duration: 30,
        address: 'Mission District',
        dietaryOptions: ['vegetarian', 'vegan'],
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        openTime: '08:00',
        closeTime: '16:00'
      },
      {
        id: '10',
        name: 'Golden Gate Bridge',
        type: 'landmark',
        description: 'Iconic suspension bridge and San Francisco landmark',
        price: 0,
        duration: 25,
        address: 'Golden Gate',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
        openTime: '00:00',
        closeTime: '23:59'
      },
      {
        id: '11',
        name: 'Mission Chinese Food',
        type: 'restaurant',
        cuisine: 'Chinese',
        description: 'Creative Sichuan-inspired dishes with SF twist',
        price: 25,
        duration: 50,
        address: 'Mission District',
        dietaryOptions: ['vegetarian', 'vegan'],
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800',
        openTime: '17:00',
        closeTime: '22:00'
      },
      {
        id: '12',
        name: 'Fisherman\'s Wharf',
        type: 'landmark',
        description: 'Waterfront area with sea lions and maritime history',
        price: 0,
        duration: 20,
        address: 'Fisherman\'s Wharf',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
        openTime: '09:00',
        closeTime: '20:00'
      },
      {
        id: '13',
        name: 'Swan Oyster Depot',
        type: 'restaurant',
        cuisine: 'Seafood',
        description: 'Classic seafood counter serving fresh oysters since 1912',
        price: 30,
        duration: 40,
        address: 'Nob Hill',
        dietaryOptions: ['gluten-free', 'pescatarian'],
        image: 'https://images.unsplash.com/photo-1559579312-23d4f96d6c0f?w=800',
        openTime: '10:30',
        closeTime: '17:00'
      },
      {
        id: '14',
        name: 'La Taqueria',
        type: 'restaurant',
        cuisine: 'Mexican',
        description: 'Award-winning tacos and burritos in the Mission',
        price: 14,
        duration: 30,
        address: 'Mission District',
        dietaryOptions: ['vegetarian', 'vegan', 'gluten-free'],
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
        openTime: '11:00',
        closeTime: '21:00'
      },
      {
        id: '15',
        name: 'Alcatraz Island',
        type: 'landmark',
        description: 'Historic former prison with bay views',
        price: 0,
        duration: 30,
        address: 'Alcatraz',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1590619948936-1778dc487175?w=800',
        openTime: '08:30',
        closeTime: '16:00'
      }
    ],
    'Tokyo': [
      {
        id: '16',
        name: 'Tsukiji Outer Market',
        type: 'restaurant',
        cuisine: 'Japanese',
        description: 'Fresh sushi and street food at the famous fish market',
        price: 18,
        duration: 45,
        address: 'Tsukiji',
        dietaryOptions: ['pescatarian'],
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        openTime: '05:00',
        closeTime: '14:00'
      },
      {
        id: '17',
        name: 'Senso-ji Temple',
        type: 'landmark',
        description: 'Ancient Buddhist temple in Asakusa',
        price: 0,
        duration: 30,
        address: 'Asakusa',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
        openTime: '06:00',
        closeTime: '17:00'
      },
      {
        id: '18',
        name: 'Ichiran Ramen',
        type: 'restaurant',
        cuisine: 'Japanese',
        description: 'Individual booth dining for perfect tonkotsu ramen',
        price: 12,
        duration: 35,
        address: 'Shibuya',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800',
        openTime: '00:00',
        closeTime: '23:59'
      },
      {
        id: '19',
        name: 'Tokyo Tower',
        type: 'landmark',
        description: 'Iconic communications tower with observation decks',
        price: 0,
        duration: 25,
        address: 'Minato',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
        openTime: '09:00',
        closeTime: '23:00'
      },
      {
        id: '20',
        name: 'Afuri Ramen',
        type: 'restaurant',
        cuisine: 'Japanese',
        description: 'Light yuzu-infused ramen and craft beer',
        price: 14,
        duration: 30,
        address: 'Harajuku',
        dietaryOptions: ['vegetarian', 'vegan'],
        image: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=800',
        openTime: '11:00',
        closeTime: '23:00'
      },
      {
        id: '21',
        name: 'Shibuya Crossing',
        type: 'landmark',
        description: 'World\'s busiest pedestrian crossing',
        price: 0,
        duration: 15,
        address: 'Shibuya',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
        openTime: '00:00',
        closeTime: '23:59'
      },
      {
        id: '22',
        name: 'Tempura Kondo',
        type: 'restaurant',
        cuisine: 'Japanese',
        description: 'Michelin-starred tempura artistry',
        price: 45,
        duration: 60,
        address: 'Ginza',
        dietaryOptions: ['pescatarian'],
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
        openTime: '11:30',
        closeTime: '20:30'
      }
    ],
    'Paris': [
      {
        id: '23',
        name: 'L\'As du Fallafel',
        type: 'restaurant',
        cuisine: 'Middle Eastern',
        description: 'Famous falafel in the Marais district',
        price: 8,
        duration: 25,
        address: 'Le Marais',
        dietaryOptions: ['vegetarian', 'vegan'],
        image: 'https://images.unsplash.com/photo-1593007791459-8a9e4c7c4a4e?w=800',
        openTime: '11:00',
        closeTime: '23:30'
      },
      {
        id: '24',
        name: 'Eiffel Tower',
        type: 'landmark',
        description: 'Iconic iron lattice tower',
        price: 0,
        duration: 30,
        address: 'Champ de Mars',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
        openTime: '09:30',
        closeTime: '23:45'
      },
      {
        id: '25',
        name: 'Breizh Café',
        type: 'restaurant',
        cuisine: 'French',
        description: 'Authentic Breton crêpes with organic ingredients',
        price: 16,
        duration: 40,
        address: 'Le Marais',
        dietaryOptions: ['vegetarian', 'gluten-free'],
        image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800',
        openTime: '10:00',
        closeTime: '23:00'
      },
      {
        id: '26',
        name: 'Louvre Museum',
        type: 'landmark',
        description: 'World\'s largest art museum',
        price: 0,
        duration: 25,
        address: 'Louvre',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
        openTime: '09:00',
        closeTime: '18:00'
      },
      {
        id: '27',
        name: 'Pierre Hermé',
        type: 'restaurant',
        cuisine: 'Bakery',
        description: 'World-renowned macarons and pastries',
        price: 10,
        duration: 20,
        address: 'Saint-Germain-des-Prés',
        dietaryOptions: ['vegetarian'],
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        openTime: '10:00',
        closeTime: '20:00'
      },
      {
        id: '28',
        name: 'Notre-Dame',
        type: 'landmark',
        description: 'Medieval Catholic cathedral',
        price: 0,
        duration: 20,
        address: 'Île de la Cité',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        openTime: '08:00',
        closeTime: '18:45'
      },
      {
        id: '29',
        name: 'Septime',
        type: 'restaurant',
        cuisine: 'French',
        description: 'Modern French cuisine in a casual setting',
        price: 38,
        duration: 75,
        address: '11th Arrondissement',
        dietaryOptions: ['vegetarian'],
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        openTime: '12:15',
        closeTime: '22:00'
      }
    ]
  };

  if (cities[city]) return cities[city];

  // Dynamic Generation for "Any City"
  const cuisines = ['Local Delicacy', 'Fusion', 'Street Food', 'Traditional', 'Modern'];
  const types = ['restaurant', 'landmark', 'restaurant', 'landmark', 'restaurant'];
  
  return Array.from({ length: 8 }).map((_, i) => {
    const isRestaurant = types[i % types.length] === 'restaurant';
    const cuisine = cuisines[i % cuisines.length];
    return {
      id: `dynamic-${i}`,
      name: isRestaurant ? `${city} ${cuisine} Hub` : `Historic ${city} Square`,
      type: isRestaurant ? 'restaurant' : 'landmark',
      cuisine: isRestaurant ? cuisine : undefined,
      description: isRestaurant 
        ? `A top-rated spot for ${cuisine.toLowerCase()} in the heart of ${city}.`
        : `A significant historical landmark reflecting the culture of ${city}.`,
      price: isRestaurant ? 10 + (i * 5) : 0,
      duration: 30 + (i * 10),
      address: `${city} District ${i + 1}`,
      dietaryOptions: i % 2 === 0 ? ['vegetarian', 'vegan'] : ['gluten-free'],
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&city=${city}`,
      openTime: '09:00',
      closeTime: '22:00'
    };
  });
}
