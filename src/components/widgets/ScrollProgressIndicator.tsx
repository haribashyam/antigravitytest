'use client';

import React, { useEffect, useState } from 'react';

/**
 * ScrollProgressIndicator
 * Ultra-smooth 60fps scroll-linked progress indicator for FuelWise.
 * Calibrated with Nothing OS Red and visionOS specular glow.
 */
export function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const currentScroll = window.scrollY;
            const progress = Math.min(1, Math.max(0, currentScroll / totalHeight));
            setScrollProgress(progress);
          } else {
            setScrollProgress(0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div
      id="scroll-indicator"
      className="fixed top-0 left-0 right-0 z-[100] pointer-events-none select-none h-[3.5px] overflow-hidden"
      aria-hidden="true"
    >
      {/* Dynamic Glowing Progress Fill */}
      <div
        className="h-full w-full bg-gradient-to-r from-red-600 via-red-500 to-rose-400 dark:from-red-600 dark:via-red-500 dark:to-white origin-left shadow-[0_0_10px_rgba(255,42,52,0.9)] transition-transform duration-75 ease-out"
        style={{
          transform: `scaleX(${scrollProgress})`,
          transformOrigin: '0% 50%',
        }}
      />
    </div>
  );
}

export default ScrollProgressIndicator;
