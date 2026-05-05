import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DotMatrixProps {
  rows?: number;
  cols?: number;
  gap?: number;
  color?: string;
  className?: string;
  animate?: boolean;
}

export const DotGrid = ({ 
  rows = 20, 
  cols = 40, 
  gap = 20, 
  color = "var(--nothing-lime)", 
  className = "",
  animate = true 
}: DotMatrixProps) => {
  const dots = useMemo(() => {
    return Array.from({ length: rows * cols }).map((_, i) => ({
      id: i,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.1 + 0.05
    }));
  }, [rows, cols]);

  return (
    <div 
      className={`grid ${className} pointer-events-none`} 
      style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${gap}px`,
        width: 'fit-content'
      }}
    >
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="w-[1px] h-[1px] rounded-full"
          style={{ backgroundColor: color }}
          animate={animate ? {
            opacity: [dot.opacity, 0.4, dot.opacity],
            scale: [1, 2, 1],
          } : {}}
          transition={animate ? {
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut"
          } : {}}
        />
      ))}
    </div>
  );
};

export const DotMatrixHeader = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`w-1 h-1 ${i < 4 ? 'bg-[var(--nothing-lime)]' : 'bg-[var(--nothing-text-dim)] opacity-10'}`} />
        ))}
      </div>
      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--nothing-text-dim)] opacity-40">{text}</h2>
    </div>
  );
};
