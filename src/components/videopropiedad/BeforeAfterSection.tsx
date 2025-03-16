
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

const beforeAfterPairs = [
  {
    id: 1,
    title: 'Salón Modernizado',
    before: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=2000&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1600607687644-c7171b62ccd2?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Cocina Renovada',
    before: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2000&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000&auto=format&fit=crop'
  }
];

export const BeforeAfterSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activePair = beforeAfterPairs[activeIndex];
  
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value[0]);
  };
  
  return (
    <section className="py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Antes y Después</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desliza para ver la diferencia que marcan nuestras transformaciones.
          </p>
        </motion.div>
        
        <div className="flex gap-4 mb-8 justify-center">
          {beforeAfterPairs.map((pair, index) => (
            <button
              key={pair.id}
              onClick={() => setActiveIndex(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeIndex === index 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {pair.title}
            </button>
          ))}
        </div>
        
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-full h-[500px] overflow-hidden rounded-xl shadow-xl"
        >
          {/* After Image (Background) */}
          <div className="absolute inset-0">
            <img 
              src={activePair.after} 
              alt="After" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Before Image (Foreground with clip) */}
          <div 
            className="absolute inset-0"
            style={{ 
              clipPath: `inset(0 ${100 - sliderValue}% 0 0)` 
            }}
          >
            <img 
              src={activePair.before} 
              alt="Before" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
            style={{ 
              left: `${sliderValue}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 20L16 12L8 4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 20L8 12L16 4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          {/* Labels */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            Antes
          </div>
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            Después
          </div>
        </motion.div>
        
        <div className="mt-6 max-w-md mx-auto">
          <Slider
            value={[sliderValue]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleSliderChange}
            className="py-4"
          />
        </div>
      </div>
    </section>
  );
};
