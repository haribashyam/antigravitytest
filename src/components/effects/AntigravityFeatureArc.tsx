'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  Compass,
  Activity,
  Terminal,
  Waves,
  Target,
  Sliders,
  Zap,
  Shield,
  GitCompare,
  TrendingDown,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useSmoothScroll } from './SmoothScrollProvider';

const ARC_ICONS = [
  { icon: Sparkles, label: 'Neural Telemetry', hint: '60 FPS WebGL2 Sensor Mesh' },
  { icon: Target, label: 'Window-Sticker Audit', hint: 'Eliminating 40% dyno fiction' },
  { icon: Terminal, label: 'Physics Equation', hint: 'Quadratic aerodynamic V² drag' },
  { icon: Sliders, label: 'Dynamic Cockpit', hint: 'Real-time resistance simulation' },
  { icon: Activity, label: 'OLS Regression', hint: 'Closed-loop Matrix Calibrator' },
  { icon: Compass, label: 'Spatial Routes', hint: 'Topography & grade elevation' },
  { icon: Car, label: 'Vehicle Telemetry', hint: 'Engine displacement & frontal area' },
  { icon: Waves, label: 'PatternWaves GLSL', hint: 'Fluid dynamic shockwave wake' },
  { icon: Zap, label: 'Instant Solvers', hint: 'Sub-millisecond inference' },
  { icon: GitCompare, label: 'Scenario Audit', hint: 'Peak vs Off-peak comparison' },
  { icon: TrendingDown, label: 'Loss Diagnostics', hint: 'Aero, idle & weight penalties' },
  { icon: BarChart3, label: 'Accuracy Proof', hint: '±0.2L MAE test holdouts' },
  { icon: Shield, label: 'Commercial Cert', hint: 'Automotive grade data integrity' },
];

const PROMPT_STRINGS = [
  'FuelWise is our calibrated journey telemetry platform, allowing anyone to predict fuel with mathematical certainty.',
  'Governed by quadratic aerodynamic drag (V²), grade topography, and closed-loop Ordinary Least Squares regression.',
  'Eliminating window-sticker fiction before you turn the ignition.',
];

/**
 * AntigravityFeatureArc
 * 
 * Inspired by Google Antigravity (Image 4):
 * - Gentle horizontal curved arc ribbon of circular floating tool orbs
 * - Typewriter prompt bar with shimmering iridescent rainbow cursor
 * - Interactive hover micro-interactions and active state indicator
 */
export function AntigravityFeatureArc() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [promptIdx, setPromptIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isReducedMotion } = useSmoothScroll();

  // Typewriter effect cycle
  useEffect(() => {
    if (isReducedMotion) {
      setDisplayedText(PROMPT_STRINGS[0]);
      return;
    }

    const currentTarget = PROMPT_STRINGS[promptIdx];
    const typingSpeed = isDeleting ? 25 : 45;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentTarget.length) {
          setDisplayedText(currentTarget.slice(0, displayedText.length + 1));
        } else {
          // Pause at full sentence before deleting
          setTimeout(() => setIsDeleting(true), 3200);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(currentTarget.slice(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setPromptIdx((prev) => (prev + 1) % PROMPT_STRINGS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, promptIdx, isReducedMotion]);

  return (
    <div
      data-parallax-layer="2"
      className="mx-auto max-w-5xl px-4 sm:px-6 w-full mb-20 text-center select-none"
    >
      {/* 1. Curved Floating Icon Arc Ribbon */}
      <div className="relative py-6 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-cyan-500/10 blur-2xl pointer-events-none rounded-full" />

        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap relative z-10 px-2">
          {ARC_ICONS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeIdx === idx;

            // Calculate subtle curved offset based on distance from center
            const centerOffset = Math.abs(idx - (ARC_ICONS.length - 1) / 2);
            const translateY = Math.sin((centerOffset / ARC_ICONS.length) * Math.PI) * 12;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                style={{
                  transform: `translateY(${translateY}px)`,
                }}
                className={`group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 scale-110 shadow-lg shadow-red-500/25 ring-2 ring-red-500/60'
                    : 'bg-zinc-100/90 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 hover:border-red-500/40 hover:scale-105 hover:bg-white dark:hover:bg-zinc-800 shadow-sm'
                }`}
                title={item.label}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />

                {/* Micro tooltip pill on hover */}
                <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-black text-white text-[10px] font-mono whitespace-nowrap px-2.5 py-1 rounded-full border border-white/15 z-30 shadow-xl">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Google Antigravity Typewriter Prompt Bar (Image 4) */}
      <div className="mt-4 max-w-3xl mx-auto px-4">
        <div className="relative inline-block text-left">
          <p className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-zinc-950 dark:text-white font-sans leading-snug">
            {displayedText}
            {/* Shimmering Multicolored Cursor (Google Antigravity iconic rainbow gradient) */}
            <span
              className="inline-block w-[3px] h-[1.15em] ml-1 align-middle animate-pulse rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, #38bdf8 0%, #818cf8 35%, #fb7185 70%, #fbbf24 100%)',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.65)',
              }}
            />
          </p>

          {/* Active Tool Subtitle / Telemetry Hint */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="uppercase tracking-wider font-bold text-zinc-800 dark:text-zinc-200">
              MODULE: {ARC_ICONS[activeIdx].label}
            </span>
            <span>•</span>
            <span className="text-red-600 dark:text-red-400 font-semibold">
              {ARC_ICONS[activeIdx].hint}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
