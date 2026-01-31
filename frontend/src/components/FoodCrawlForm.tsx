import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, DollarSign, Clock, Apple, User, BookOpen, ChevronRight, ChevronLeft, Plus, History, Star } from 'lucide-react';
import type { CrawlParams } from '../App';

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

export function FoodCrawlForm({ onGenerate }: Props) {
  const [step, setStep] = useState(0); // 0: Cover/All About You, 1: Form
  const [city, setCity] = useState('');
  const [isCityDropdown, setIsCityDropdown] = useState(false);
  const [budget, setBudget] = useState(50);
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
      onGenerate({ 
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

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBudget(Math.max(0, Math.min(1000, value)));
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
              {step === 0 ? (
                <motion.div
                  key="step0"
                  initial={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -110, opacity: 0, transition: { duration: 0.8, ease: [0.645, 0.045, 0.355, 1] } }}
                  className="w-full h-full p-6 sm:p-12 flex flex-col items-center origin-left h-full"
                >
                <div className="max-w-xl w-full text-center space-y-8 sm:space-y-12">
                  <div className="space-y-4">
                    <User className="w-12 h-12 sm:w-16 h-16 mx-auto mb-4 sm:mb-6" style={{ color: '#F59F00' }} />
                    <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: '#242116', fontFamily: 'Parkinsans' }}>All About You</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Your culinary journal and taste profile.</p>
                  </div>

                  <div className="grid gap-4 sm:gap-6">
                    <button 
                      onClick={() => setStep(1)}
                      className="group flex items-center justify-between p-4 sm:p-6 bg-white border-2 border-dashed border-[#F59F00] rounded-2xl hover:bg-[#F59F00]/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-[#F59F00]/10 rounded-xl group-hover:bg-[#F59F00]/20 transition-colors">
                          <Plus className="w-5 h-5 sm:w-6 h-6" style={{ color: '#F59F00' }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg" style={{ color: '#242116' }}>Start a New Chapter</h3>
                          <p className="text-xs sm:text-sm text-gray-500">Generate a fresh culinary route.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 sm:w-6 h-6 text-gray-400 group-hover:text-[#F59F00] transition-colors" />
                    </button>

                    <button 
                      className="group flex items-center justify-between p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#D1E892] hover:bg-[#D1E892]/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-gray-100 rounded-xl group-hover:bg-[#D1E892]/20 transition-colors">
                          <History className="w-5 h-5 sm:w-6 h-6 text-gray-400 group-hover:text-[#242116]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg" style={{ color: '#242116' }}>Previous Crawls</h3>
                          <p className="text-xs sm:text-sm text-gray-500">Revisit your past flavor journeys.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 sm:w-6 h-6 text-gray-400" />
                    </button>

                    <button 
                      className="group flex items-center justify-between p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#F59F00] hover:bg-[#F59F00]/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-gray-100 rounded-xl group-hover:bg-[#F59F00]/20 transition-colors">
                          <Star className="w-5 h-5 sm:w-6 h-6 text-gray-400 group-hover:text-[#F59F00]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg" style={{ color: '#242116' }}>Preset Preferences</h3>
                          <p className="text-xs sm:text-sm text-gray-500">Quick-load your standard filters.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 sm:w-6 h-6 text-gray-400" />
                    </button>
                  </div>

                  <div className="pt-6 sm:pt-8 border-t border-gray-100">
                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2">
                      <BookOpen className="w-3 h-3 sm:w-4 h-4" /> Munchy Edition 2026
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
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
                    onClick={() => setStep(0)}
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
                      <label className="flex items-center gap-2 mb-3 font-medium" style={{ color: '#242116' }}>
                        <MapPin className="w-5 h-5" style={{ color: '#F59F00' }} />
                        Where to?
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          onFocus={() => setIsCityDropdown(true)}
                          placeholder="Search any city..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                          style={{ borderColor: city ? '#F59F00' : '#e5e7eb' }}
                        />
                        {isCityDropdown && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                            {['Tokyo', 'Paris', 'New York', 'London', 'Bangkok', 'Rome', 'Seoul', 'Mexico City'].map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                  setCity(suggestion);
                                  setIsCityDropdown(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#F59F00]/5 transition-colors text-sm border-b border-gray-50 last:border-0"
                              >
                                {suggestion}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setIsCityDropdown(false)}
                              className="w-full text-center px-4 py-2 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-[#F59F00]"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-3 font-medium" style={{ color: '#242116' }}>
                        <DollarSign className="w-5 h-5" style={{ color: '#D1E892' }} />
                        Budget
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={budget}
                          onChange={handleBudgetChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors"
                          style={{ borderColor: budget > 0 ? '#D1E892' : '#e5e7eb' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Time Window */}
                  <div>
                    <label className="flex items-center gap-2 mb-3 font-medium" style={{ color: '#242116' }}>
                      <Clock className="w-5 h-5" style={{ color: '#D1E892' }} />
                      Time Window
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-400 w-12">From</span>
                        <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-[#D1E892] outline-none bg-white">
                          {hours.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-[#D1E892] outline-none bg-white">
                          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)} className="p-3 border-2 border-gray-100 rounded-xl focus:border-[#D1E892] outline-none bg-white font-bold">
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-400 w-12">To</span>
                        <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-[#D1E892] outline-none bg-white">
                          {hours.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-[#D1E892] outline-none bg-white">
                          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)} className="p-3 border-2 border-gray-100 rounded-xl focus:border-[#D1E892] outline-none bg-white font-bold">
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dietary */}
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
                          onClick={() => toggleDietary(opt.value)}
                          className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                          style={{
                            backgroundColor: dietary.includes(opt.value) ? '#F59F00' : '#fff',
                            color: dietary.includes(opt.value) ? '#fff' : '#242116',
                            border: dietary.includes(opt.value) ? '2px solid #F59F00' : '2px solid #f3f4f6'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
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
            )}
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
