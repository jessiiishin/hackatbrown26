import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Book from './Book'
import { CrawlItinerary } from './CrawlItinerary';
import { cities } from './utils/citymock';
import type { CrawlParams, Crawl, Stop } from './types.tsx';

export default function Home() {
  const [crawl, setCrawl] = useState<Crawl | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateCrawl = (params: CrawlParams) => {
    setCrawl(null);
    setTimeout(() => {
      setCrawl(generateCrawl(params));
    }, 500);
  };

  const handleReset = () => setCrawl(null);

  return (
    <div className="min-h-screen bg-[#FDF8EF]">
      {/* Centered container with proper padding */}
      <div className="max-w-7xl mx-auto px-12 pt-24 pb-20" style={{ paddingTop: '2.5rem' }}>
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
            y: isLoading ? 20 : 0,
          }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="relative">
            <Book onGenerate={handleGenerateCrawl} />
            {/* {!crawl ? (
              <FoodCrawlForm onGenerate={handleGenerateCrawl} />
            ) : (
              <CrawlItinerary crawl={crawl} onReset={handleReset} />
            )} */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* --- FOOD CRAWL LOGIC --- */
function generateCrawl(params: CrawlParams): Crawl {
  const cityData = cities[params.city];

  const startMinutes = timeToMinutes(params.startTime);
  const endMinutes = timeToMinutes(params.endTime);
  const totalAvailableTime =
    endMinutes > startMinutes ? endMinutes - startMinutes : 1440 - startMinutes + endMinutes;

  const availableStops = filterStops(cityData, params);
  const selectedStops = selectOptimalStops(availableStops, params, totalAvailableTime);

  const totalCost = selectedStops.reduce((sum, stop) => (stop.type === 'restaurant' ? sum + stop.price : sum), 0);
  const totalTime = selectedStops.reduce((sum, stop) => sum + stop.duration, 0);

  return {
    stops: selectedStops,
    totalCost,
    totalTime,
    route: generateRoute(selectedStops),
  };
}

/* --- helper functions --- */
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

  const checkTimeInRange = (time: number, start: number, end: number) =>
    start <= end ? time >= start && time <= end : time >= start || time <= end;

  return checkTimeInRange(windowStart, stopOpen, stopClose) || checkTimeInRange(windowEnd, stopOpen, stopClose);
}

function filterStops(stops: Stop[], params: CrawlParams): Stop[] {
  const windowStart = timeToMinutes(params.startTime);
  const windowEnd = timeToMinutes(params.endTime);

  return stops.filter((stop) => {
    if (!isStopOpen(stop, windowStart, windowEnd)) return false;
    if (stop.type === 'landmark') return true;
    if (params.dietary.length > 0) return params.dietary.some((diet) => stop.dietaryOptions.includes(diet));
    return true;
  });
}

function selectOptimalStops(stops: Stop[], params: CrawlParams, availableTime: number): Stop[] {
  const { budget } = params;
  const restaurants = stops.filter((s) => s.type === 'restaurant');
  const landmarks = stops.filter((s) => s.type === 'landmark');

  const selected: Stop[] = [];
  let currentCost = 0;
  let currentTimeUsed = 0;
  let restaurantIndex = 0;
  let landmarkIndex = 0;
  let addRestaurant = true;

  while (currentTimeUsed < availableTime) {
    if (addRestaurant && restaurantIndex < restaurants.length) {
      const r = restaurants[restaurantIndex];
      if (currentCost + r.price <= budget && currentTimeUsed + r.duration <= availableTime) {
        selected.push(r);
        currentCost += r.price;
        currentTimeUsed += r.duration;
      }
      restaurantIndex++;
    } else if (!addRestaurant && landmarkIndex < landmarks.length) {
      const l = landmarks[landmarkIndex];
      if (currentTimeUsed + l.duration <= availableTime) {
        selected.push(l);
        currentTimeUsed += l.duration;
      }
      landmarkIndex++;
    }
    addRestaurant = !addRestaurant;
    if (restaurantIndex >= restaurants.length && landmarkIndex >= landmarks.length) break;
  }

  return selected.length > 0 ? selected : stops.slice(0, 3);
}

function generateRoute(stops: Stop[]): string {
  return stops.map((stop, i) => (i === 0 ? `Start at ${stop.name}` : `→ ${stop.name}`)).join(' ');
}
