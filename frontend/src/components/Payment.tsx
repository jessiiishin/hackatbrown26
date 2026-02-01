import { ChevronLeft, Check } from 'lucide-react';
import { useState } from 'react';

interface PaymentProps {
  setStep: (step: number) => void;
}

export default function Payment({ setStep }: PaymentProps) {
  const [selectedPlan, setSelectedPlan] = useState<'oneTime' | 'fiveTimes' | 'tenTimes'>('tenTimes');

  const plans = [
    {
      id: 'oneTime',
      name: 'Single Pass',
      tickets: 1,
      price: 99.99,
      description: 'Pre-pay for 1 crawl',
      features: [
        'Pays for one food crawl',
        'Never expires',
      ],
    },
    {
      id: 'fiveTimes',
      name: 'Five Passes',
      tickets: 5,
      price: 399.99,
      description: 'Pre-pay for 5 crawls',
      features: [
        'Pays for five food crawls',
        'Never expires',
      ],
      popular: true,
    },
    {
      id: 'tenTimes',
      name: 'Ten Passes',
      tickets: 10,
      price: 799.99,
      description: 'Pre-pay for 10 crawls',
      features: [
        'Pays for ten food crawls',
        'Never expires',
      ],
    },
  ];

  return (
    <div className="w-full h-full p-6 sm:p-12 flex flex-col items-center box-border overflow-hidden" 
        style={{ backgroundColor: '#fdfaf3', borderRadius: '24px' }}>
      {/* Header with back button */}
      <div className="relative flex items-center justify-center mb-8 w-full shrink-0">
        <button
          onClick={() => setStep(0)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors absolute left-0"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: '#242116', fontFamily: 'Parkinsans' }}>
          Munchy Pass
        </h1>
      </div>

      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Subtitle */}
        <div className="mb-12">
          <p className="text-lg text-gray-600">
            Pre-pay for all your munches!
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        style={{ marginBottom: '1.5rem'}}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`relative p-6 sm:p-8 rounded-3xl transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? 'border-2 bg-white shadow-lg'
                  : 'border-2 border-gray-200 bg-white hover:border-gray-300'
              }`}
              style={{
                borderColor: selectedPlan === plan.id ? '#F59F00' : undefined,
                boxShadow: selectedPlan === plan.id ? '0 0 0 3px rgba(245, 159, 0, 0.1)' : undefined,
                borderRadius: '24px'
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-2 -right-2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: '#F59F00' }}
                >
                  Most Popular
                </div>
              )}

              {/* Plan name and price */}
              <div className="mb-6 flex flex-col items-center">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#242116' }}>
                  {plan.name}
                </h3>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold mx-8" style={{ color: '#F59F00' }}>
                      ${plan.price}
                    </span>
                    <span className="text-gray-500"> total</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ${(plan.price / plan.tickets).toFixed(2)} per pass
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                {/* Features list */}
                <div className="space-y-3 mb-6 mt-4 max-w-xs mx-auto">
                    {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#F59F00' }} />
                        <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                    ))}
                </div>
              </div>

              {/* Select button */}
              <button
                className="w-full py-3 rounded-xl font-bold transition-all"
                style={{
                  backgroundColor: selectedPlan === plan.id ? '#F59F00' : '#f3f4f6',
                  color: selectedPlan === plan.id ? '#FDF8EF' : '#242116',
                }}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Purchase button */}
        <div className="mt-12">
          <button
            onClick={() => setStep(3)}
            className="w-full sm:w-64 rounded-2xl font-bold text-xl transition-all shadow-lg"
            style={{
              backgroundColor: '#F59F00',
              color: '#FDF8EF',
              padding: '12px'
            }}
          >
            Buy {selectedPlan === 'oneTime' ? '1 Pass' : selectedPlan === 'fiveTimes' ? '5 Passes' : '10 Passes'}
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Secure payment powered by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
