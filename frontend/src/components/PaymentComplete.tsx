import { Check, ChevronRight } from 'lucide-react';

interface PaymentCompleteProps {
  setStep: (step: number) => void;
}

export default function PaymentComplete({ setStep }: PaymentCompleteProps) {
  return (
    <div className="w-full h-full p-6 sm:p-12 flex flex-col items-center box-border overflow-hidden" 
        style={{ backgroundColor: '#fdfaf3', borderRadius: '24px' }}>
      <div className="max-w-2xl w-full flex flex-col items-center justify-center h-full space-y-8">
        {/* Success Icon */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full" style={{ backgroundColor: '#F59F00' }}>
          <Check className="w-12 h-12" style={{ color: '#FDF8EF' }} />
        </div>

        {/* Success Message */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold" style={{ color: '#242116', fontFamily: 'Parkinsans', fontSize: '32px'}}>
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your Munchy Pass has been activated
          </p>
        </div>

        {/* Details Card */}
        <div className="w-full p-6 sm:p-8 rounded-2xl border-2 border-gray-200 space-y-4" style={{ backgroundColor: '#FDF8EF' }}>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Order Confirmation</span>
            <span className="text-sm font-mono text-gray-500">#MUNCH-2026</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Passes Purchased</span>
            <span className="font-bold" style={{ color: '#242116' }}>5 Passes</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-bold text-lg" style={{ color: '#F59F00' }}>$23.99</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59F00' }}></div>
              <span className="font-medium" style={{ color: '#242116' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        <p className="text-center text-sm text-gray-600">
          A confirmation email has been sent to your inbox. You can now continue creating food crawls!
        </p>

        {/* Action Button */}
        <button
          onClick={() => setStep(1)}
          className="w-full sm:w-64 py-6 rounded-2xl font-bold text-xl transition-all shadow-lg flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#F59F00',
            color: '#FDF8EF',
            padding: '12px'
          }}
        >
          Continue Creating Crawls
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
