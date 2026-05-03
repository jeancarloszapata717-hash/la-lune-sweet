import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: string;
  size: string;
  duration: string;
  delay: string;
  opacity: number;
}

export default function SugarParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles resembling powdered sugar
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + 'vw',
      size: Math.random() * 4 + 2 + 'px', // 2px to 6px
      duration: Math.random() * 10 + 5 + 's', // 5s to 15s fall duration
      delay: Math.random() * -15 + 's', // Start at random points in animation loop
      opacity: Math.random() * 0.6 + 0.2 // Varying opacities
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bg-white rounded-full animate-sugar shadow-[0_0_4px_rgba(255,255,255,0.8)]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            top: '-10px'
          }}
        />
      ))}
    </div>
  );
}
