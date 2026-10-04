'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANTIGRAVITY_CONFIG } from './AntigravityConfig';

// Register GSAP ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollY: number;
  scrollVelocity: number;
  isReducedMotion: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollY: 0,
  scrollVelocity: 0,
  isReducedMotion: false,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [scrollState, setScrollState] = useState({ scrollY: 0, scrollVelocity: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const rafTickerRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReducedMotion(prefersReducedMotion);

    if (prefersReducedMotion) {
      // Respect user's motion preference: keep native scrolling, no inertia
      return;
    }

    // Initialize Lenis with smooth exponential deceleration
    const lenis = new Lenis({
      duration: ANTIGRAVITY_CONFIG.scroll.duration,
      smoothWheel: ANTIGRAVITY_CONFIG.scroll.smoothWheel,
      wheelMultiplier: ANTIGRAVITY_CONFIG.scroll.wheelMultiplier,
      touchMultiplier: ANTIGRAVITY_CONFIG.scroll.touchMultiplier,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    setLenisInstance(lenis);

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      setScrollState({
        scrollY: e.scroll,
        scrollVelocity: e.velocity,
      });
    });

    // Synchronize GSAP ticker and Lenis requestAnimationFrame
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    rafTickerRef.current = tickerCallback;
    gsap.ticker.add(tickerCallback);

    // Disable GSAP lag smoothing to ensure lockstep synchronization
    gsap.ticker.lagSmoothing(0);

    // Pause animation & smooth scroll when browser tab is hidden to maintain 60fps & save battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount to prevent any memory leaks or lingering listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafTickerRef.current) {
        gsap.ticker.remove(rafTickerRef.current);
      }
      lenis.destroy();
      setLenisInstance(null);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisInstance,
        scrollY: scrollState.scrollY,
        scrollVelocity: scrollState.scrollVelocity,
        isReducedMotion,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
