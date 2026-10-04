'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANTIGRAVITY_CONFIG } from './AntigravityConfig';
import { useSmoothScroll } from './SmoothScrollProvider';

interface AntigravityDepthParallaxProps {
  children: React.ReactNode;
}

/**
 * AntigravityDepthParallax
 * 
 * Orchestrates:
 * 1. Pinned Hero (100vh scroll scrub): Hero text scales up and fades out while
 *    the Simulator Cockpit zooms in with 3D spatial perspective (Image 3 inspiration).
 * 2. 3D Section Transitions: Each section enters with CSS 3D perspective (1200px),
 *    scaling from 0.92 -> 1.0 and rotating X (6deg -> 0deg), reversing on scroll up.
 * 3. 3-Layer Parallax: Elements tagged with data-parallax-layer="1|2|3" move at
 *    differential scroll speeds (background 0.35x, middle 0.75x, foreground 1.15x).
 * 4. Respects prefers-reduced-motion and performs full unmount cleanup.
 */
export function AntigravityDepthParallax({ children }: AntigravityDepthParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    if (isReducedMotion) {
      // Keep native layout and simple visibility for reduced motion preference
      return;
    }

    const ctx = gsap.context(() => {
      // ════════ 1. PINNED HERO & 3D COCKPIT ZOOM (IMAGE 3) ════════
      const heroSection = container.querySelector<HTMLElement>('[data-hero-pin-section]');
      const heroText = container.querySelector<HTMLElement>('[data-hero-text]');
      const cockpit = container.querySelector<HTMLElement>('[data-cockpit-window]');

      if (heroSection && heroText && cockpit) {
        // Prepare cockpit initial 3D projection state
        gsap.set(cockpit, {
          transformPerspective: ANTIGRAVITY_CONFIG.hero.cockpitPerspective,
          transformOrigin: '50% 20%',
          scale: ANTIGRAVITY_CONFIG.hero.cockpitInitialScale,
          rotateX: ANTIGRAVITY_CONFIG.hero.cockpitInitialRotateX,
          opacity: 0.8,
          y: 50,
          willChange: 'transform, opacity',
        });

        gsap.set(heroText, {
          willChange: 'transform, opacity, filter',
        });

        // Timeline tied to hero pinned scroll
        const heroTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: `+=${ANTIGRAVITY_CONFIG.hero.pinDistance}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Hero text scales out and fades into space
        heroTimeline.to(
          heroText,
          {
            scale: ANTIGRAVITY_CONFIG.hero.textScaleOut,
            opacity: 0,
            y: -50,
            filter: 'blur(8px)',
            ease: 'power1.inOut',
          },
          0
        );

        // Cockpit window flies forward from deep space into foreground focus
        heroTimeline.to(
          cockpit,
          {
            scale: 1.0,
            rotateX: 0,
            opacity: 1.0,
            y: 0,
            ease: 'power2.out',
          },
          0.1
        );
      }

      // ════════ 2. SECTION 3D TRANSITIONS ════════
      // Each section tagged with [data-3d-section] fades, scales, and tilts into view
      const sections = container.querySelectorAll<HTMLElement>('[data-3d-section]');
      sections.forEach((section) => {
        gsap.set(section, {
          transformPerspective: ANTIGRAVITY_CONFIG.transitions.perspective,
          transformOrigin: '50% 15%',
          willChange: 'transform, opacity',
        });

        gsap.fromTo(
          section,
          {
            opacity: 0.45,
            scale: ANTIGRAVITY_CONFIG.transitions.initialScale,
            rotateX: ANTIGRAVITY_CONFIG.transitions.initialRotateX,
            y: 40,
          },
          {
            opacity: 1,
            scale: ANTIGRAVITY_CONFIG.transitions.targetScale,
            rotateX: 0,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              end: 'top 35%',
              scrub: ANTIGRAVITY_CONFIG.transitions.scrubSpeed,
            },
          }
        );
      });

      // ════════ 3. DEPTH PARALLAX LAYERS ════════
      // Layer 1: Background ambient glows (moves slower, speed ~0.35x)
      const bgElements = container.querySelectorAll<HTMLElement>('[data-parallax-layer="1"]');
      bgElements.forEach((el) => {
        gsap.to(el, {
          y: (i, target) => {
            const distance = window.innerHeight * 0.35;
            return target.dataset.parallaxReverse ? -distance : distance;
          },
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Layer 2: Middle headers / arc ribbons (speed ~0.75x)
      const midElements = container.querySelectorAll<HTMLElement>('[data-parallax-layer="2"]');
      midElements.forEach((el) => {
        gsap.to(el, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Layer 3: Foreground interactive items (moves faster forward)
      const fgElements = container.querySelectorAll<HTMLElement>('[data-parallax-layer="3"]');
      fgElements.forEach((el) => {
        gsap.to(el, {
          y: -70,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, containerRef);

    // Refresh ScrollTrigger after DOM measurement
    ScrollTrigger.refresh();

    // Clean up all triggers and GSAP tweens on unmount
    return () => {
      ctx.revert();
    };
  }, [isReducedMotion]);

  return (
    <div ref={containerRef} className="relative w-full">
      {children}
    </div>
  );
}
