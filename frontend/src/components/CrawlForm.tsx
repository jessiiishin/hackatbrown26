import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, DollarSign, Clock, Apple, ChevronRight, ChevronLeft } from 'lucide-react';
import type { CrawlParams, BudgetTier } from './types';
import { BUDGET_TIERS } from '../utils/pricerangestuff'

interface Props {
  setStep: (step: number) => void;
  onGenerate: (params: CrawlParams) => void;
}

interface CityProps {
  city: string;
  setCity: (value: string) => void;
  isCityDropdown: boolean;
  setIsCityDropdown: (value: boolean) => void;
}

interface TimeComponentProps {
  startHour: string;
  setStartHour: (value: string) => void;
  startMinute: string;
  setStartMinute: (value: string) => void;
  startPeriod: string;
  setStartPeriod: (value: string) => void;
  endHour: string;
  setEndHour: (value: string) => void;
  endMinute: string;
  setEndMinute: (value: string) => void;
  endPeriod: string;
  setEndPeriod: (value: string) => void;
  hours: string[];
  minutes: string[];
}

interface BudgetProps {
  budgetTier: BudgetTier;
  setBudgetTier: (tier: BudgetTier) => void;
}

interface DietaryProp {
  toggleDietary: (value: string) => void;
  dietary: string[];
}

const CITIES = ['New York', 'San Francisco', 'Tokyo', 'Paris'];
const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
];

export default function FoodCrawlForm(props: Props) {
  const [city, setCity] = useState('');
  const [isCityDropdown, setIsCityDropdown] = useState(false);
  const [budget, setBudget] = useState<BudgetTier>('$');
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endHour, setEndHour] = useState('05');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState('PM');
  const [dietary, setDietary] = useState<string[]>([]);
  const [isClicked, setIsClicked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      props.onGenerate({ 
        city, 
        budget, 
        startTime: `${startHour}:${startMinute} ${startPeriod}`, 
        endTime: `${endHour}:${endMinute} ${endPeriod}`, 
        dietary 
      });
    }, 200);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const toggleDietary = (value: string) => {
    setDietary(prev => prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]);
  };

  return (
    <motion.div
      key="step1"
      initial={{ rotateY: 110, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -110, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
      className="w-full h-full p-6 sm:p-12 origin-left h-full"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => props.setStep(0)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h2 className="text-3xl font-bold" style={{ color: '#242116', fontFamily: 'Parkinsans' }}>Chapter Setup</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* City Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <CityComponent 
              city={city}
              setCity={setCity}
              isCityDropdown={isCityDropdown}
              setIsCityDropdown={setIsCityDropdown}
            />
          </div>

          <div>
            <BudgetComponent
              budgetTier={budget}
              setBudgetTier={setBudget}
            />
          </div>
        </div>

        {/* Time Window */}
        <div>
          <TimeComponent 
            startHour={startHour}
            setStartHour={setStartHour}
            startMinute={startMinute}
            setStartMinute={setStartMinute}
            startPeriod={startPeriod}
            setStartPeriod={setStartPeriod}
            endHour={endHour}
            setEndHour={setEndHour}
            endMinute={endMinute}
            setEndMinute={setEndMinute}
            endPeriod={endPeriod}
            setEndPeriod={setEndPeriod}
            hours={hours}
            minutes={minutes}
          />
        </div>

        {/* Dietary */}
        <div>
          <DietaryComponent 
            toggleDietary={toggleDietary}
            dietary={dietary}/>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!city}
            className="w-full py-5 rounded-2xl font-bold text-xl transition-all relative overflow-hidden group shadow-lg"
            style={{
              backgroundColor: city ? '#F59F00' : '#f3f4f6',
              color: city ? '#FDF8EF' : '#a1a1aa',
              cursor: city ? 'pointer' : 'not-allowed',
              transform: isClicked ? 'scale(0.96)' : 'scale(1)'
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {city ? 'Write Chapter' : 'Pick a City'}
              {city && <ChevronRight className="w-6 h-6" />}
            </span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function CityComponent(props: CityProps) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-3 font-medium" style={{ color: '#242116' }}>
        <MapPin className="w-5 h-5" style={{ color: '#F59F00' }} />
        Where to?
      </label>
      <div className="relative">
        <input
          type="text"
          value={props.city}
          onChange={(e) => props.setCity(e.target.value)}
          onFocus={() => props.setIsCityDropdown(true)}
          placeholder="Search any city..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
          style={{ borderColor: props.city ? '#F59F00' : '#e5e7eb' }}
        />
        {props.isCityDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
            {['Tokyo', 'Paris', 'New York', 'London', 'Bangkok', 'Rome', 'Seoul', 'Mexico City'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  props.setCity(suggestion);
                  props.setIsCityDropdown(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-[#F59F00]/5 transition-colors text-sm border-b border-gray-50 last:border-0"
              >
                {suggestion}
              </button>
            ))}
            <button
              type="button"
              onClick={() => props.setIsCityDropdown(false)}
              className="w-full text-center px-4 py-2 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-[#F59F00]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeComponent(props: TimeComponentProps) {
  return(
    <div>
      <label className="flex items-center gap-2 mb-3 font-medium" style={{ color: '#242116' }}>
        <Clock className="w-5 h-5" style={{ color: '#F59F00' }} />
        Time Window
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-400 w-12">From</span>
          <select value={props.startHour} onChange={(e) => props.setStartHour(e.target.value)} className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-[#C1EA78] outline-none bg-white">
            {props.hours.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={props.startMinute} onChange={(e) => props.setStartMinute(e.target.value)} className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-[#C1EA78] outline-none bg-white">
            {props.minutes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={props.startPeriod} onChange={(e) => props.setStartPeriod(e.target.value)} className="p-3 border-2 border-gray-100 rounded-xl focus:border-[#C1EA78] outline-none bg-white font-bold">
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-400 w-12">To</span>
          <select value={props.endHour} onChange={(e) => props.setEndHour(e.target.value)} className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-[#C1EA78] outline-none bg-white">
            {props.hours.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={props.endMinute} onChange={(e) => props.setEndMinute(e.target.value)} className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-[#C1EA78] outline-none bg-white">
            {props.minutes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={props.endPeriod} onChange={(e) => props.setEndPeriod(e.target.value)} className="p-3 border-2 border-gray-100 rounded-xl focus:border-[#C1EA78] outline-none bg-white font-bold">
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function DietaryComponent(props: DietaryProp) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-4 font-medium" style={{ color: '#242116' }}>
        <Apple className="w-5 h-5" style={{ color: '#F59F00' }} />
        Dietary Notes
      </label>
      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => props.toggleDietary(opt.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: props.dietary.includes(opt.value) ? '#F59F00' : '#fff',
              color: props.dietary.includes(opt.value) ? '#fff' : '#242116',
              border: props.dietary.includes(opt.value) ? '2px solid #F59F00' : '2px solid #f3f4f6'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BudgetComponent(props: BudgetProps) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-3 font-medium" style={{ color: '#242116' }}>
        <DollarSign className="w-5 h-5" style={{ color: '#C1EA78' }} />
        Price Tier
      </label>
      <div className="flex flex-wrap gap-2">
        {BUDGET_TIERS.map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => props.setBudgetTier(tier)}
            className="px-4 py-3 rounded-xl font-bold text-lg transition-all border-2"
            style={{
              backgroundColor: props.budgetTier === tier ? '#F59F00' : '#fff',
              color: props.budgetTier === tier ? '#FDF8EF' : '#242116',
              borderColor: props.budgetTier === tier ? '#F59F00' : '#e5e7eb',
            }}
          >
            {tier}
          </button>
        ))}
      </div>
    </div>
  );
}
