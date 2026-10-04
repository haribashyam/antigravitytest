'use client';

import React, { useState, useEffect } from 'react';
import { useSmoothScroll } from './SmoothScrollProvider';

interface AntigravityTextRevealProps {
  className?: string;
}

const LINE_1 = 'Know your real';
const LINE_2 = 'fuel costs.';
const LINE_3 = 'Before you turn the ignition.';

/**
 * Iridescent Rainbow Cursor matching AntigravityFeatureArc (Picture 2 reference)
 */
function RainbowCursor({ height = '1.1em' }: { height?: string }) {
  return (
    <span
      className="inline-block align-middle rounded-full animate-pulse will-change-transform"
      style={{
        width: 'clamp(3px, 0.05em, 5px)',
        height,
        marginLeft: '0.18em',
        background:
          'linear-gradient(180deg, #38bdf8 0%, #818cf8 35%, #fb7185 70%, #fbbf24 100%)',
        boxShadow: '0 0 12px rgba(99, 102, 241, 0.7), 0 0 4px rgba(251, 113, 133, 0.5)',
      }}
      aria-hidden="true"
    />
  );
}

/**
 * AntigravityTextReveal
 * 
 * Typewriter hero reveal inspired by Google Antigravity & FuelWise Feature Arc (Picture 2):
 * - Seamless letter-by-letter typing animation for the complete headline
 * - Fills in the missing 'fuel costs.' with crisp, high-contrast typography
 * - Multicolored shimmering rainbow cursor bar tracking the active letter
 * - Preserves layout height to eliminate layout shift (zero CLS)
 * - Types once sequentially (Line 1 -> Line 2 -> Line 3) and rests with glowing cursor
 * - Fully accessible and respects prefers-reduced-motion
 */
export function AntigravityTextReveal({ className = '' }: AntigravityTextRevealProps) {
  const [displayedLine1, setDisplayedLine1] = useState('');
  const [displayedLine2, setDisplayedLine2] = useState('');
  const [displayedLine3, setDisplayedLine3] = useState('');
  const [stage, setStage] = useState<1 | 2 | 3 | 'done'>(1);
  const { isReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (isReducedMotion) {
      setDisplayedLine1(LINE_1);
      setDisplayedLine2(LINE_2);
      setDisplayedLine3(LINE_3);
      setStage('done');
      return;
    }

    let timeoutId: NodeJS.Timeout;

    if (stage === 1) {
      if (displayedLine1.length < LINE_1.length) {
        timeoutId = setTimeout(() => {
          setDisplayedLine1(LINE_1.slice(0, displayedLine1.length + 1));
        }, 36);
      } else {
        timeoutId = setTimeout(() => {
          setStage(2);
        }, 140);
      }
    } else if (stage === 2) {
      if (displayedLine2.length < LINE_2.length) {
        timeoutId = setTimeout(() => {
          setDisplayedLine2(LINE_2.slice(0, displayedLine2.length + 1));
        }, 42);
      } else {
        timeoutId = setTimeout(() => {
          setStage(3);
        }, 160);
      }
    } else if (stage === 3) {
      if (displayedLine3.length < LINE_3.length) {
        timeoutId = setTimeout(() => {
          setDisplayedLine3(LINE_3.slice(0, displayedLine3.length + 1));
        }, 28);
      } else {
        timeoutId = setTimeout(() => {
          setStage('done');
        }, 100);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayedLine1, displayedLine2, displayedLine3, stage, isReducedMotion]);

  // Helper to render line 2 with an accent period dot
  const renderLine2 = (text: string) => {
    if (text.endsWith('.')) {
      return (
        <>
          {text.slice(0, -1)}
          <span className="text-red-500 font-bold font-nothing">.</span>
        </>
      );
    }
    return text;
  };

  return (
    <h1
      className={`text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[1.06] font-nothing ${className}`}
      aria-label="Know your real fuel costs. Before you turn the ignition."
    >
      {/* Line 1: Know your real */}
      <span className="block min-h-[1.08em]">
        {displayedLine1}
        {stage === 1 && <RainbowCursor height="1.05em" />}
      </span>

      {/* Line 2: fuel costs. (previously missing/cut off) */}
      <span className="block mt-1 min-h-[1.08em] text-zinc-950 dark:text-white">
        {renderLine2(displayedLine2)}
        {stage === 2 && <RainbowCursor height="1.05em" />}
        {displayedLine2.length === 0 && <span className="invisible select-none">&nbsp;</span>}
      </span>

      {/* Line 3: Before you turn the ignition. */}
      <span className="block text-2xl sm:text-4xl md:text-5xl font-medium text-zinc-700 dark:text-zinc-300 mt-3 sm:mt-4 tracking-tight font-sans min-h-[1.2em]">
        {displayedLine3}
        {(stage === 3 || stage === 'done') && <RainbowCursor height="1.05em" />}
        {displayedLine3.length === 0 && <span className="invisible select-none">&nbsp;</span>}
      </span>
    </h1>
  );
}
