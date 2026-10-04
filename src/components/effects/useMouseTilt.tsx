'use client';

import { useEffect, useRef } from 'react';
import { ANTIGRAVITY_CONFIG } from './AntigravityConfig';

/**
 * useMouseTilt
 * 
 * Applies a smooth 3D tilt effect up to 6 degrees toward the cursor:
 * - Desktop only (disabled on touch devices / mobile screens < 768px)
 * - Animates only transform (rotateX, rotateY, scale3d) to guarantee 60fps
 * - Respects prefers-reduced-motion
 * - Auto-cleans up listeners on unmount
 */
export function useMouseTilt<T extends HTMLElement = HTMLDivElement>() {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check device type & reduced motion
    const isDesktop = window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isDesktop || prefersReducedMotion) {
      return;
    }

    const { maxAngleDegrees, perspective, transitionSpeedMs, scaleOnHover } = ANTIGRAVITY_CONFIG.tilt;

    el.style.transformStyle = 'preserve-3d';
    el.style.transition = `transform ${transitionSpeedMs}ms cubic-bezier(0.16, 1, 0.3, 1)`;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0 to 1
      const y = (e.clientY - rect.top) / rect.height; // 0 to 1

      // Calculate tilt angles (tilts up to maxAngleDegrees toward the cursor)
      const rotateX = ((y - 0.5) * -maxAngleDegrees).toFixed(2);
      const rotateY = ((x - 0.5) * maxAngleDegrees).toFixed(2);

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, ${scaleOnHover})`;
    };

    const handleMouseLeave = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (el) {
        el.style.transform = '';
      }
    };
  }, []);

  return elementRef;
}

/**
 * AntigravityTiltCard
 * 
 * Reusable wrapper component for cards that want subtle 6-degree 3D cursor tilt.
 */
export function AntigravityTiltCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const tiltRef = useMouseTilt<HTMLDivElement>();

  return (
    <div ref={tiltRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
