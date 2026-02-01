import { useState, useEffect, useRef } from 'react';
import { MapPin, DollarSign, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import type { CrawlParams, BudgetTier } from './types';
import { BUDGET_TIERS } from '../utils/pricerangestuff';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const AUTOCOMPLETE_DEBOUNCE_MS = 300;

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
      });
    }, 200);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div
      className="w-full h-full p-6 sm:p-12 origin-left overflow-visible flex flex-col"
    >
      <div className="flex items-center gap-4 mb-8 w-full shrink-0">
        <button
          onClick={() => props.setStep(0)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h2
          className="text-3xl font-bold"
          style={{ color: '#242116', fontFamily: 'Parkinsans' }}
        >
          Chapter Setup
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl flex-1 overflow-y-auto">
        {/* City Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="overflow-visible">
            <CityComponent 
              city={city}
              setCity={setCity}
              isCityDropdown={isCityDropdown}
              setIsCityDropdown={setIsCityDropdown}
            />

            <BudgetComponent
              budgetTier={budget}
              setBudgetTier={setBudget}
            />
          </div>

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

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!city}
            className="w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-lg"
            style={{
              backgroundColor: city ? '#F59F00' : '#f3f4f6',
              color: city ? '#FDF8EF' : '#a1a1aa',
              cursor: city ? 'pointer' : 'not-allowed',
              transform: isClicked ? 'scale(0.96)' : 'scale(1)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              {city ? 'Write Chapter' : 'Pick a City'}
              {city && <ChevronRight className="w-6 h-6" />}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

function CityComponent(props: CityProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = props.city.trim();

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setLoading(true);
      const url = `${API_BASE}/places/autocomplete?input=${encodeURIComponent(query)}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data.suggestions) ? data.suggestions : [];
          setSuggestions(list);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, AUTOCOMPLETE_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasMatches = suggestions.length > 0;

  return (
    <div className="relative">
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
          onBlur={() => setTimeout(() => props.setIsCityDropdown(false), 200)}
          placeholder="Type a city name..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
          style={{ borderColor: props.city ? '#F59F00' : '#e5e7eb' }}
          autoComplete="off"
        />
        {props.isCityDropdown && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500">Searching cities…</div>
            ) : hasMatches ? (
              suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    props.setCity(suggestion);
                    props.setIsCityDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#F59F00]/10 transition-colors text-sm border-b border-gray-50 last:border-0"
                >
                  {suggestion}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No matching cities. You can still type any city and search.
              </div>
            )}
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
