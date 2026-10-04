'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSmoothScroll } from './SmoothScrollProvider';

interface AntigravityTextRevealProps {
  className?: string;
}

/**
 * AntigravityTextReveal
 * 
 * Inspired by Google Antigravity (Image 1 & 2):
 * - One-by-one character / letter typewriter reveal animation
 * - Subtle upward float (`translateY`) + blur clearing + opacity transition
 * - Preserves exact typography, responsive font sizes, and Nothing OS gradient
 * - Respects prefers-reduced-motion
 */
export function AntigravityTextReveal({ className = '' }: AntigravityTextRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const { isReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (!containerRef.current) return;

    if (isReducedMotion) {
      // Show immediately for reduced motion
      const chars = containerRef.current.querySelectorAll('.antigravity-char');
      chars.forEach((c) => {
        (c as HTMLElement).style.opacity = '1';
        (c as HTMLElement).style.transform = 'translateY(0)';
        (c as HTMLElement).style.filter = 'blur(0)';
      });
      return;
    }

    const chars = containerRef.current.querySelectorAll('.antigravity-char');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          opacity: 0,
          y: 14,
          filter: 'blur(6px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.028, // smooth one-by-one character pacing
          delay: 0.15,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isReducedMotion]);

  // Helper to split text into individual character spans while preserving whitespace
  const renderChars = (text: string) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className="antigravity-char inline-block will-change-transform"
        style={{ opacity: 0 }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <h1
      ref={containerRef}
      className={`text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[1.04] font-nothing ${className}`}
    >
      <span className="block">{renderChars('Know your real')}</span>
      
      <span className="block mt-1 bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent drop-shadow-sm">
        {renderChars('fuel costs')}
        <span className="text-red-500 font-mono inline-block animate-pulse ml-0.5">.</span>
      </span>

      <span className="block text-2xl sm:text-4xl md:text-5xl font-medium text-zinc-700 dark:text-zinc-300 mt-3 tracking-tight font-sans">
        {renderChars('Before you turn the ignition.')}
      </span>
    </h1>
  );
}
