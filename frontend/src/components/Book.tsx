import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { MapPin, DollarSign, Clock, Apple } from 'lucide-react';
import type { CrawlParams } from './types';
import StartPage from './StartPage';
import CrawlForm from './CrawlForm';

interface Props {
  onGenerate: (params: CrawlParams) => void;
  step?: number;
  setStep?: (step: number) => void;
}

const CITIES = ['New York', 'San Francisco', 'Tokyo', 'Paris', 'Seattle', 'Boston', 'Chicago'];
const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
];

export default function Book({ onGenerate, step: initialStep = 0, setStep: setParentStep }: Props) {
  const [step, setLocalStep] = useState(initialStep);

  // Sync with parent step changes
  useEffect(() => {
    setLocalStep(initialStep);
  }, [initialStep]);

  // Wrapper for setStep that updates both local and parent state
  const setStep = (newStep: number) => {
    setLocalStep(newStep);
    if (setParentStep) {
      setParentStep(newStep);
    }
  };

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
    <div className="relative max-w-5xl mx-auto h-[1000px]">
      <div className="relative w-full h-full flex justify-center items-center">
        
        {/* The Book Spread Container */}
        <div className="relative w-full h-full flex">
          
          {/* Active Main Page */}
          <div className="flex-1 bg-[#fdfaf3] rounded-2xl shadow-2xl relative transition-all duration-700"
               style={{ boxShadow: '20px 20px 60px rgba(0,0,0,0.1)' }}>
            
             <AnimatePresence mode="wait">
              {renderPage()}
            </AnimatePresence>
        </div>
        </div>

        {/* Shadow floor */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/10 blur-3xl rounded-full -z-10" />
      </div>
    </div>
  );
}
