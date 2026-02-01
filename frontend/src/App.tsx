import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodCrawlForm } from './components/FoodCrawlForm';
import { CrawlItinerary } from './components/CrawlItinerary';
import { SetupInstructions } from './components/SetupInstructions';
import { LoadingScreen } from './components/LoadingScreen';
import axios from 'axios';

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

export default function App() {
  const [crawl, setCrawl] = useState<Crawl | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial app load simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Updated: Fetch landmarks from backend
  const handleGenerateCrawl = async (params: CrawlParams) => {
    setCrawl(null);
    setIsLoading(true);
    try {
      // Convert time to backend format (HHMM)
      const timeToHHMM = (t: string) => {
        const [time, period] = t.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}${(m || 0).toString().padStart(2, '0')}`;
      };
      const res = await axios.post('http://localhost:3001/landmarks', {
        city: params.city,
        visitDate: new Date().toISOString().slice(0, 10), // Use today's date for demo
        timeStart: timeToHHMM(params.startTime),
        timeEnd: timeToHHMM(params.endTime),
        budget: params.budget
      });
      const stops = res.data.landmarks.map((l: any, idx: number) => ({
        id: l.place_id || String(idx),
        name: l.name,
        type: 'landmark',
        cuisine: '',
        description: l.address,
        price: l.price_level !== undefined ? l.price_level : 0,
        duration: 30, // Default duration, or use l.duration if available
        address: l.address,
        dietaryOptions: [],
        image: l.photo_url || '',
        openTime: l.openTime || '',
        closeTime: l.closeTime || '',
      }));
      setCrawl({
        stops,
        totalCost: stops.reduce((sum: number, s: Stop) => sum + (s.price || 0), 0),
        totalTime: stops.length * 30,
        route: stops.map((s: Stop) => s.name).join(' → ')
      });
    } catch (err) {
      alert('Failed to fetch landmarks.');
    } finally {
      setIsLoading(false);
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
          {!crawl ? (
            <FoodCrawlForm onGenerate={handleGenerateCrawl} />
          ) : (
            <CrawlItinerary crawl={crawl} onReset={handleReset} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
