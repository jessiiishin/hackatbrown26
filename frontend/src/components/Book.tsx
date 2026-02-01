import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { MapPin, DollarSign, Clock, Apple } from 'lucide-react';
import type { CrawlParams } from './types';
import StartPage from './StartPage';
import CrawlForm from './CrawlForm';

interface Props {
  onGenerate: (params: CrawlParams) => void;
}

const CITIES = ['New York', 'San Francisco', 'Tokyo', 'Paris'];
const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
];

export default function Book({ onGenerate }: Props) {
  const [step, setStep] = useState(0); // 0: Cover/All About You, 1: Form
  

  const renderPage = () => {
    switch (step) {
      case 0:
        return <StartPage setStep={setStep} />;
      case 1:
        return <CrawlForm setStep={setStep} onGenerate={onGenerate} />;
      default:
        return <StartPage setStep={setStep} />;
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto min-h-[700px] perspective-2000">
      <div className="relative w-full h-full flex justify-center items-center py-12">
        
        {/* The Book Spread Container */}
        <div className="relative w-full flex items-stretch min-h-[650px] sm:perspective-2000">
          
          {/* Static Left Page (Portion of previous page) - Hidden on very small screens */}
          <div className="hidden sm:flex w-[80px] md:w-[120px] bg-[#f7f3e9] rounded-l-2xl border-r border-black/10 shadow-lg relative overflow-hidden flex-shrink-0">
             {/* Binding shadow */}
             <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10" />
             {/* Content Hint */}
             <div className="p-4 opacity-20 pointer-events-none select-none">
                <div className="w-full h-4 bg-gray-400 rounded mb-4" />
                <div className="w-full h-32 bg-gray-200 rounded mb-4" />
                <div className="w-full h-4 bg-gray-300 rounded mb-2" />
                <div className="w-2/3 h-4 bg-gray-300 rounded" />
             </div>
          </div>

          {/* Active Main Page (Right side that flips) */}
          <div className="flex-1 bg-[#fdfaf3] rounded-2xl sm:rounded-l-none sm:rounded-r-2xl shadow-2xl relative transition-all duration-700 overflow-hidden"
               style={{ boxShadow: '20px 20px 60px rgba(0,0,0,0.1)' }}>
            
             <AnimatePresence mode="wait">
              {renderPage()}
            </AnimatePresence>
        </div>
          
          {/* Decorative binding details */}
          <div className="absolute left-[12px] top-4 bottom-4 w-[2px] bg-black/5" />
          <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-white/40" />
        </div>

        {/* Shadow floor */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/10 blur-3xl rounded-full -z-10" />
      </div>
    </div>
  );
}
