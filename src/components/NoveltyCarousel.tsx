import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function NoveltyCarousel() {
  const [flyers] = useState<string[]>([
    'https://images.unsplash.com/photo-1578985543062-d977ad398632?q=80&w=1000&auto=format&fit=crop', // Placeholder for cupcakes
    'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=1000&auto=format&fit=crop'  // Placeholder for cake
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (flyers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flyers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [flyers.length]);

  if (flyers.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto aspect-square relative overflow-hidden rounded-[2rem] shadow-xl border-4 border-white/50 bg-brand-cream/30">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={flyers[currentIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover object-center"
          alt="Novedad La Lune Sweet"
        />
      </AnimatePresence>

      {/* Indicadores (Dots) */}
      {flyers.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {flyers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-brand-hotpink w-6' : 'bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
