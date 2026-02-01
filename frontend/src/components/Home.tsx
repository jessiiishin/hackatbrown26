import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import Book from './Book'
import { CrawlItinerary } from './CrawlItinerary';
import { cities } from './utils/citymock';
import type { CrawlParams, Crawl, Stop, BudgetTier } from './types.tsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Home() {
  const [crawl, setCrawl] = useState<Crawl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);
  const [bookStep, setBookStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateCrawl = async (params: CrawlParams) => {
    setCrawl(null);
    setCrawlError(null);
    setIsGenerating(true);
    try {
      const url = `${API_BASE}/places/restaurants?city=${encodeURIComponent(params.city)}&budgetTier=${encodeURIComponent(params.budget)}`;
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
        budgetTier: params.budget,
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

  // Handler to fetch landmarks and display as a crawl (mirroring restaurant logic)
  const handleGenerateLandmarkCrawl = async (params: CrawlParams) => {
    setCrawl(null);
    setCrawlError(null);
    setIsGenerating(true);
    try {
      const url = `${API_BASE}/places/landmarks?city=${encodeURIComponent(params.city)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Request failed (${res.status})`);
      }
      const data = await res.json();
      const stops = mapApiLandmarksToStops(data.landmarks || [], params);
      if (stops.length === 0) {
        setCrawlError('No landmarks found. Try a different city.');
        return;
      }
      setCrawl({
        stops,
        totalCost: 0,
        totalTime: stops.length * 30,
        route: stops.map((s: Stop) => s.name).join(' → '),
        budgetTier: params.budget,
      });
    } catch (err) {
      setCrawlError(err instanceof Error ? err.message : 'Failed to load landmarks.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler to fetch both restaurants and landmarks and display as a combined crawl
  const handleGenerateCombinedCrawl = async (params: CrawlParams) => {
    setCrawl(null);
    setCrawlError(null);
    setIsGenerating(true);
    try {
      // Fetch restaurants
      const restUrl = `${API_BASE}/places/restaurants?city=${encodeURIComponent(params.city)}&budgetTier=${encodeURIComponent(params.budget)}`;
      const restRes = await fetch(restUrl);
      if (!restRes.ok) {
        const errData = await restRes.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Request failed (${restRes.status})`);
      }
      const restData = await restRes.json();
      const restaurantStops = mapApiRestaurantsToStops(restData.restaurants || [], params);

      // Fetch landmarks
      const landUrl = `${API_BASE}/places/landmarks?city=${encodeURIComponent(params.city)}`;
      const landRes = await fetch(landUrl);
      if (!landRes.ok) {
        const errData = await landRes.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Request failed (${landRes.status})`);
      }
      const landData = await landRes.json();
      const landmarkStops = (landData.landmarks || []).map((l: any, idx: number) => ({
        id: l.id || `landmark-${idx}`,
        name: l.name,
        type: 'landmark' as const,
        description: l.address,
        price: 0,
        duration: 30,
        address: l.address,
        dietaryOptions: [],
        image: l.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        openTime: '',
        closeTime: '',
        lat: l.lat,
        lng: l.lng,
        color: 'purple',
      }));

      // Combine and sort (optional: sort by name or interleave)
      const stops = [...restaurantStops, ...landmarkStops];
      if (stops.length === 0) {
        setCrawlError('No restaurants or landmarks found. Try a different city.');
        return;
      }
      // Optionally, sort or interleave
      stops.sort((a, b) => a.name.localeCompare(b.name));
      const totalCost = stops.reduce((sum, s) => sum + s.price, 0);
      const totalTime = stops.reduce((sum, s) => sum + s.duration, 0);
      setCrawl({
        stops,
        totalCost,
        totalTime,
        route: stops.map((s: Stop) => s.name).join(' → ')
      });
    } catch (err) {
      setCrawlError(err instanceof Error ? err.message : 'Failed to load crawl.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setCrawl(null);
    setBookStep(1); // Go back to form step
  };

  const handleOrderOptimized = useCallback((orderedStops: Stop[]) => {
    setCrawl((prev) =>
      prev
        ? { ...prev, stops: orderedStops, route: generateRoute(orderedStops) }
        : null
    );
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Gradient overlay with grain texture */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(253, 248, 239, 1) 0%, rgba(253, 248, 239, 1) 28%, rgba(245, 159, 0, 0.2) 100%), url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\' seed=\'2\'/%3E%3C/filter%3E%3Crect width=\'400\' height=\'400\' filter=\'url(%23noiseFilter)\' opacity=\'0.12\'/%3E%3C/svg%3E")', backgroundBlendMode: 'overlay' }} />
      
      {/* Centered container with proper padding */}
      <div className="max-w-7xl mx-auto px-12 pt-24 pb-20 relative z-10" style={{ paddingTop: '2.5rem' }}>
        {/* Header */}
        <header className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="h-[2px] w-12 bg-[#F59F00]" />
            <span className="uppercase tracking-[0.3em] text-xs font-bold text-[#F59F00]">
              The Culinary Journal
            </span>
            <div className="h-[2px] w-12 bg-[#F59F00]" />
          </div>
          <h1
            className="text-7xl font-bold tracking-tighter"
            style={{ color: '#242116', fontFamily: 'Parkinsans' }}
          >
            Munchy
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-80" style={{ color: '#242116' }}>
            Curating personalized food crawls, one chapter at a time.
          </p>
        </header>

        {/* Animated content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isLoading ? 0 : 1,
            y: isLoading ? 20 : 0
          }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >

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
              <Book onGenerate={handleGenerateCombinedCrawl} step={bookStep} setStep={setBookStep} />
            ) : (
              <CrawlItinerary
                crawl={crawl}
                onReset={handleReset}
                onOrderOptimized={handleOrderOptimized}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
// Food crawl generation algorithm
function generateCrawl(params: CrawlParams): Crawl {
  const cityData = cities[params.city];
  
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
    priceTier: s.type === 'restaurant' ? params.budget : undefined,
  }));

  return {
    stops: stopsWithTier,
    totalCost,
    totalTime,
    route: generateRoute(stopsWithTier),
    budgetTier: params.budget,
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
  const [minPrice, maxPrice] = PRICE_TIER_RANGE[params.budget];

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
  const budgetMax = BUDGET_TIER_MAX[params.budget];
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
  /** Photo URL from Place Photos (New) when available */
  image?: string | null;
}

const API_PRICE_LEVEL_TO_TIER: Record<string, BudgetTier> = {
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
};

function mapApiRestaurantsToStops(restaurants: ApiRestaurant[], params: CrawlParams): Stop[] {
  const pricePerStop = Math.round(BUDGET_TIER_MAX[params.budget] / 5);
  const placeholderImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

  const matching = restaurants.filter((r) => {
    if (!r.priceLevel) return true;
    const tier = API_PRICE_LEVEL_TO_TIER[r.priceLevel];
    return tier === params.budget;
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
    image: (r.image && r.image.trim()) ? r.image : placeholderImage,
    openTime: '09:00',
    closeTime: '22:00',
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    priceTier: params.budget,
  }));
}

// Helper to map API landmarks to Stop objects
function mapApiLandmarksToStops(landmarks: any[], params: CrawlParams): Stop[] {
  const placeholderImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800';
  return (landmarks || []).map((l: any, idx: number) => ({
    id: l.id || `landmark-${idx}`,
    name: l.name,
    type: 'landmark' as const,
    description: l.address,
    price: 0,
    duration: 30,
    address: l.address,
    dietaryOptions: [],
    image: l.image || placeholderImage,
    openTime: '',
    closeTime: '',
    lat: l.lat,
    lng: l.lng,
    color: 'purple',
  }));
}