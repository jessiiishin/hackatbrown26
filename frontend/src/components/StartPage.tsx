import { ChevronRight, Plus } from 'lucide-react';

interface StartPageProps {
    setStep: (step: number) => void;
}

export default function StartPage({ setStep }: StartPageProps) {
    return (
        <div
            key="step0"
            className="w-full h-[1000px] p-6 sm:p-12 flex flex-col items-center box-border overflow-y-auto"
        >
            <div className="max-w-xl w-full text-center space-y-8 sm:space-y-12">
                <div className="space-y-4">
                <img src="/munch.png" alt="Munch" style={{ width: '120px', height: '120px' }} className="mx-auto mb-4 sm:mb-6 object-contain" />
                <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: '#242116', fontFamily: 'Parkinsans' }}>
                    Munching Awaits!
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                    Start your very own food tour today
                </p>
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
                        <h3 className="font-bold text-base sm:text-lg" style={{ color: '#242116' }}>Start a New Munch Mission</h3>
                        <p className="text-xs sm:text-sm text-gray-500">Generate a fresh culinary route.</p>
                    </div>
                    </div>
                    <ChevronRight className="w-5 h-5 sm:w-6 h-6 text-gray-400 group-hover:text-[#F59F00] transition-colors" />
                </button>

                <button 
                    onClick={() => setStep(2)}
                    className="group flex items-center justify-between p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#C1EA78] hover:bg-[#C1EA78]/5 transition-all text-left"
                >
                    <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gray-100 rounded-xl group-hover:bg-[#C1EA78]/20 transition-colors">
                        <Plus className="w-5 h-5 sm:w-6 h-6 text-gray-400 group-hover:text-[#C1EA78]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg" style={{ color: '#242116' }}>Buy Munchy Pass</h3>
                        <p className="text-xs sm:text-sm text-gray-500">Unlock premium culinary experiences.</p>
                    </div>
                    </div>
                    <ChevronRight className="w-5 h-5 sm:w-6 h-6 text-gray-400" />
                </button>
                </div>
                <div className="m-24"></div>
            </div>
        </div>
    )
}