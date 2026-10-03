'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  href?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  href = '/',
}) => {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Precision Aerospace / Nothing OS Hybrid Geometric Emblem */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-zinc-950/90 border border-white/20 shadow-lg shadow-black/50 overflow-hidden transition-all duration-300 group-hover:border-red-500/60 group-hover:shadow-[0_0_20px_rgba(229,9,20,0.45)] group-hover:scale-105 ${iconSizes[size]}`}>
        {/* Subtle radial inner glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.25)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Vector Automotive Telemetry Emblem */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 transition-transform duration-500 group-hover:rotate-12"
        >
          <defs>
            <linearGradient id="brand-grad-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#a1a1aa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#e50914" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="fuel-flame-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#e50914" />
              <stop offset="50%" stopColor="#ff2a34" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="core-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Outer Tachometer / Telemetry Arc with ticks */}
          <circle
            cx="18"
            cy="18"
            r="15"
            stroke="url(#brand-grad-ring)"
            strokeWidth="1.2"
            strokeDasharray="4 2.5"
            className="opacity-75"
          />

          {/* Inner subtle concentric guideline */}
          <circle
            cx="18"
            cy="18"
            r="11"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.8"
          />

          {/* Fluid Fuel Droplet & Aerodynamic Velocity Vector */}
          <path
            d="M 18 8 
               C 18 8, 24 15, 24 20 
               A 6 6 0 0 1 12 20 
               C 12 15, 18 8, 18 8 Z"
            fill="url(#fuel-flame-grad)"
            filter="url(#core-glow)"
            className="transition-all duration-300"
          />

          {/* Central Quantum Combustion Ember (Nothing Red LED) */}
          <circle
            cx="18"
            cy="20.5"
            r="2"
            fill="#ffffff"
            className="group-hover:animate-ping"
          />
          <circle
            cx="18"
            cy="20.5"
            r="1.2"
            fill="#e50914"
          />

          {/* Top Aerodynamic Marker Dot */}
          <circle
            cx="18"
            cy="3.5"
            r="1"
            fill="#e50914"
          />
        </svg>

        {/* Specular glass edge highlight */}
        <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none" />
      </div>

      {/* Brand Typographic Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-0.5">
          <span className={`font-extrabold tracking-tight text-zinc-950 dark:text-white font-nothing ${textSizes[size]}`}>
            Fuel
          </span>
          <span className={`font-light tracking-tight text-zinc-600 dark:text-zinc-300 font-nothing ${textSizes[size]}`}>
            Wise
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ff2a34] animate-pulse ml-0.5" />
        </div>

        {showSubtitle && (
          <span className="text-[8.5px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase font-semibold mt-1 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
            SPATIAL TELEMETRY
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
