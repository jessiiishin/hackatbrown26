import { motion } from 'motion/react';
import { User, BookOpen, ChevronRight, Plus, History, Star } from 'lucide-react';

interface StartPageProps {
    setStep: (step: number) => void;
}

export default function StartPage({ setStep }: StartPageProps) {
    return (
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
                    className="group flex items-center justify-between p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#C1EA78] hover:bg-[#C1EA78]/5 transition-all text-left"
                >
                    <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gray-100 rounded-xl group-hover:bg-[#C1EA78]/20 transition-colors">
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
    )
}