import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const SCRAPBOOK_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1697652973385-ccf1e85496b2?w=600', x: '10%', y: '15%', rotate: -15 },
  { url: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600', x: '75%', y: '10%', rotate: 12 },
  { url: 'https://images.unsplash.com/photo-1630914441934-a29bf360934c?w=600', x: '20%', y: '70%', rotate: 8 },
  { url: 'https://images.unsplash.com/photo-1681995790407-5a64283680d4?w=600', x: '80%', y: '75%', rotate: -10 },
  { url: 'https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?w=600', x: '50%', y: '80%', rotate: -5 },
  { url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600', x: '5%', y: '45%', rotate: 15 },
  { url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=600', x: '85%', y: '40%', rotate: -12 },
  { url: 'https://images.unsplash.com/photo-1495899686424-be6ded54191a?w=600', x: '45%', y: '10%', rotate: 5 },
];

export function LoadingScreen() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < SCRAPBOOK_IMAGES.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, 300); // Add a new image every 300ms
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#FDF8EF' }}
    >
      {/* Scrapbook Images */}
      {SCRAPBOOK_IMAGES.map((img, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.5, rotate: img.rotate + 20 }}
          animate={{ 
            opacity: index < visibleCount ? 1 : 0, 
            scale: index < visibleCount ? 1 : 1.5,
            rotate: index < visibleCount ? img.rotate : img.rotate + 20 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 0.8 
          }}
          className="absolute w-48 h-48 md:w-64 md:h-64 pointer-events-none"
          style={{ 
            left: img.x, 
            top: img.y,
            boxShadow: '0 10px 30px rgba(245, 159, 0, 0.2)',
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '4px'
          }}
        >
          <div className="w-full h-full overflow-hidden rounded-sm relative">
             <ImageWithFallback 
              src={img.url} 
              alt="Food" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-[8px] border-white/10" />
          </div>
        </motion.div>
      ))}

      {/* Center Branding */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="flex items-center justify-center"
          style={{ width: '7rem', height: '7rem'}}
        >
          <img src="/munch.png" alt="Munchy" className="w-16 h-16" />
        </motion.div>

        <motion.h1 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl font-bold tracking-tighter" 
          style={{ color: '#242116' }}
        >
          Munchy Munchy
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 font-medium tracking-wide uppercase text-sm"
          style={{ color: '#F59F00', letterSpacing: '0.2em' }}
        >
          Curating your journey...
        </motion.p>
      </motion.div>

      {/* Decorative Bouncing Icons background layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, Math.random() * -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          >
            <Utensils size={40 + Math.random() * 40} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
