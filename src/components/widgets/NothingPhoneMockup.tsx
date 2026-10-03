'use client';

import React, { useState } from 'react';
import { DotMatrixText } from './DotMatrixDisplay';
import { Fuel, Navigation, Zap, Compass, RotateCw, Moon, Sun, Shield } from 'lucide-react';

interface NothingPhoneMockupProps {
  speed?: number;
  efficiency?: number;
  fuelLiters?: number;
  cost?: number;
  vehicleName?: string;
  className?: string;
}

export const NothingPhoneMockup: React.FC<NothingPhoneMockupProps> = ({
  speed = 75,
  efficiency = 18.2,
  fuelLiters = 4.2,
  cost = 430,
  vehicleName = 'Tata Nexon Diesel',
  className = '',
}) => {
  const [viewSide, setViewSide] = useState<'screen' | 'glyph'>('glyph');
  const [chassisColor, setChassisColor] = useState<'dark' | 'white'>('dark');
  const [glyphActive, setGlyphActive] = useState(true);

  // Normalize fuel bar for Glyph exclamation mark (0 to 1)
  const fuelProgress = Math.min(1, Math.max(0.1, fuelLiters / 20));
  // Central coil glow intensity based on speed
  const coilIntensity = Math.min(1, Math.max(0.3, speed / 120));

  const isDark = chassisColor === 'dark';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Device Controls Toolbar */}
      <div className="flex items-center gap-2 mb-5 p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl shadow-lg">
        <button
          type="button"
          onClick={() => setViewSide(viewSide === 'screen' ? 'glyph' : 'screen')}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
        >
          <RotateCw className="w-3 h-3 text-red-500 animate-spin-reverse" />
          <span>{viewSide === 'glyph' ? 'Show Nothing OS Screen' : 'Show Glyph Back'}</span>
        </button>

        <span className="text-white/20 text-xs">|</span>

        <button
          type="button"
          onClick={() => setChassisColor(isDark ? 'white' : 'dark')}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Toggle Chassis Finish"
        >
          {isDark ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-slate-300" />}
          <span>{isDark ? 'White Finish' : 'Dark Finish'}</span>
        </button>

        <span className="text-white/20 text-xs">|</span>

        <button
          type="button"
          onClick={() => setGlyphActive(!glyphActive)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-full transition-all cursor-pointer ${
            glyphActive ? 'text-red-400 bg-red-500/15' : 'text-slate-400 hover:bg-white/10'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${glyphActive ? 'bg-red-500 shadow-[0_0_6px_#e50914]' : 'bg-slate-500'}`} />
          <span>Glyph: {glyphActive ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* ═══════════ THE NOTHING PHONE HARDWARE FRAME ═══════════ */}
      <div
        className={`relative w-[280px] sm:w-[310px] h-[580px] sm:h-[620px] rounded-[50px] p-3 transition-all duration-500 shadow-2xl ${
          isDark
            ? 'bg-[#121316] border-[4px] border-[#2c2f36] shadow-[0_30px_90px_rgba(0,0,0,0.85)]'
            : 'bg-[#e7e8eb] border-[4px] border-[#cfd1d8] shadow-[0_30px_90px_rgba(0,0,0,0.4)]'
        }`}
      >
        {/* Hardware side buttons */}
        {/* Volume Up */}
        <div
          className={`absolute -left-[7px] top-[140px] w-[3px] h-[40px] rounded-l-sm ${
            isDark ? 'bg-[#3b3e47]' : 'bg-[#b6b9c2]'
          }`}
        />
        {/* Volume Down */}
        <div
          className={`absolute -left-[7px] top-[190px] w-[3px] h-[40px] rounded-l-sm ${
            isDark ? 'bg-[#3b3e47]' : 'bg-[#b6b9c2]'
          }`}
        />
        {/* Power Button */}
        <div
          className={`absolute -right-[7px] top-[160px] w-[3px] h-[55px] rounded-r-sm ${
            isDark ? 'bg-[#3b3e47]' : 'bg-[#b6b9c2]'
          }`}
        />

        {/* Inner Phone Cavity */}
        <div
          className={`w-full h-full rounded-[42px] overflow-hidden relative transition-all duration-300 ${
            isDark ? 'bg-[#08090b]' : 'bg-[#f4f5f7]'
          }`}
        >
          {viewSide === 'screen' ? (
            /* ═══════════ FRONT: NOTHING OS DISPLAY ═══════════ */
            <div className="w-full h-full p-4 flex flex-col justify-between text-white font-nothing relative">
              {/* Punch hole camera */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black border border-white/10 z-30" />

              {/* Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 px-1 relative z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* On-Screen FuelWise Nothing OS Widget */}
              <div className="mt-6 flex flex-col gap-3 relative z-20">
                {/* Header Card */}
                <div className="p-3.5 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                      TRIP TELEMETRY
                    </span>
                    <div className="nothing-rec-dot" />
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">{vehicleName}</div>
                </div>

                {/* Big Dot Matrix Speedometer */}
                <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">INSTANT CRUISE</span>
                  <div className="my-1">
                    <DotMatrixText text={`${speed}`} size="sm" activeColor="#ffffff" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-400">KM / H</span>
                </div>

                {/* Efficiency Dial Sub-widget */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center">
                    <span className="text-[8px] font-mono text-slate-400">YIELD</span>
                    <div className="my-0.5">
                      <DotMatrixText text={`${efficiency.toFixed(1)}`} size="xs" activeColor="#34d399" />
                    </div>
                    <span className="text-[8px] font-mono text-slate-400">KM/L</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center">
                    <span className="text-[8px] font-mono text-slate-400">BURN</span>
                    <div className="my-0.5">
                      <DotMatrixText text={`${fuelLiters.toFixed(1)}`} size="xs" activeColor="#e50914" />
                    </div>
                    <span className="text-[8px] font-mono text-slate-400">LITRES</span>
                  </div>
                </div>

                {/* Trip Cost Tag */}
                <div className="p-3 rounded-2xl bg-red-600 text-white flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase">EST. TRIP COST</span>
                  <span className="text-sm font-ndot font-bold">₹{cost.toFixed(0)}</span>
                </div>
              </div>

              {/* Bottom Gesture Bar */}
              <div className="w-24 h-1 rounded-full bg-white/40 mx-auto mb-1 relative z-20" />
            </div>
          ) : (
            /* ═══════════ REAR: TRANSPARENT GLASS & GLYPH INTERFACE ═══════════ */
            <div className="w-full h-full p-4 relative flex flex-col justify-between overflow-hidden">
              {/* Internal Textured Components (screws, wireless charging coils, text) */}
              <div
                className={`absolute inset-0 ${
                  isDark ? 'bg-dot-matrix-fine opacity-20' : 'bg-dot-matrix-fine opacity-15'
                }`}
              />

              {/* Nothing Brand Text on rear plate */}
              <div
                className={`absolute bottom-6 left-6 font-ndot text-[8px] tracking-[0.25em] uppercase pointer-events-none ${
                  isDark ? 'text-white/20' : 'text-black/30'
                }`}
              >
                (NOTHING) PHONE (2)
              </div>

              {/* Screws in four corners */}
              <div className={`absolute top-4 left-4 w-2 h-2 rounded-full border ${isDark ? 'border-white/20' : 'border-black/20'}`} />
              <div className={`absolute top-4 right-4 w-2 h-2 rounded-full border ${isDark ? 'border-white/20' : 'border-black/20'}`} />
              <div className={`absolute bottom-4 left-4 w-2 h-2 rounded-full border ${isDark ? 'border-white/20' : 'border-black/20'}`} />
              <div className={`absolute bottom-4 right-4 w-2 h-2 rounded-full border ${isDark ? 'border-white/20' : 'border-black/20'}`} />

              {/* ═══════════ THE GLYPH LED STRIPS (SVG) ═══════════ */}
              <svg
                viewBox="0 0 200 400"
                className="w-full h-full absolute inset-0 p-3 pointer-events-none"
              >
                {/* Filter for white and red Glyph light bloom */}
                <defs>
                  <filter id="glyphGlowWhite" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glyphGlowRed" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. TOP-LEFT DUAL CAMERA SURROUND GLYPH */}
                {/* Camera lenses */}
                <circle cx="50" cy="50" r="16" fill={isDark ? '#0c0d10' : '#d2d4dc'} stroke={isDark ? '#262930' : '#b0b3bf'} strokeWidth="2" />
                <circle cx="50" cy="50" r="8" fill="#000000" />
                <circle cx="50" cy="85" r="16" fill={isDark ? '#0c0d10' : '#d2d4dc'} stroke={isDark ? '#262930' : '#b0b3bf'} strokeWidth="2" />
                <circle cx="50" cy="85" r="8" fill="#000000" />

                {/* Camera C-shaped glyph outline */}
                <path
                  d="M 28 35 C 28 25, 75 25, 75 35 L 75 100 C 75 110, 28 110, 28 100 Z"
                  fill="none"
                  stroke={
                    glyphActive
                      ? '#ffffff'
                      : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.12)'
                  }
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter={glyphActive ? 'url(#glyphGlowWhite)' : 'none'}
                  opacity={glyphActive ? 0.95 : 0.4}
                />

                {/* 2. TOP-RIGHT DIAGONAL SLASH GLYPH */}
                <line
                  x1="135"
                  y1="35"
                  x2="175"
                  y2="60"
                  stroke={
                    glyphActive
                      ? '#ffffff'
                      : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.12)'
                  }
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter={glyphActive ? 'url(#glyphGlowWhite)' : 'none'}
                  opacity={glyphActive ? 0.95 : 0.4}
                />

                {/* 3. CENTER WIRELESS CHARGING COIL GLYPH (Nothing Phone 2 Multi-Segment) */}
                <circle
                  cx="100"
                  cy="200"
                  r="52"
                  fill="none"
                  stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}
                  strokeWidth="8"
                />

                {/* Main Active Segment of Coil (reacts to speed intensity) */}
                <path
                  d="M 100 148 A 52 52 0 1 1 55 225"
                  fill="none"
                  stroke={
                    glyphActive
                      ? '#ffffff'
                      : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.12)'
                  }
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="28 4"
                  filter={glyphActive ? 'url(#glyphGlowWhite)' : 'none'}
                  opacity={glyphActive ? coilIntensity : 0.3}
                />

                {/* Right Segment of Coil */}
                <path
                  d="M 148 180 A 52 52 0 0 1 140 235"
                  fill="none"
                  stroke={
                    glyphActive
                      ? '#ffffff'
                      : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.12)'
                  }
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter={glyphActive ? 'url(#glyphGlowWhite)' : 'none'}
                  opacity={glyphActive ? 0.9 : 0.3}
                />

                {/* 4. BOTTOM EXCLAMATION MARK GLYPH (!) — FUEL & BATTERY PROGRESS BAR */}
                {/* Inactive background track */}
                <line
                  x1="100"
                  y1="285"
                  x2="100"
                  y2="360"
                  stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Active fuel fill level (fills from bottom upwards!) */}
                <line
                  x1="100"
                  y1={360 - fuelProgress * 75}
                  x2="100"
                  y2="360"
                  stroke={glyphActive ? '#e50914' : isDark ? '#ffffff' : '#000000'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter={glyphActive ? 'url(#glyphGlowRed)' : 'none'}
                />

                {/* Exclamation point bottom dot */}
                <circle
                  cx="100"
                  cy="374"
                  r="3.5"
                  fill={glyphActive ? '#e50914' : isDark ? '#ffffff' : '#000000'}
                  filter={glyphActive ? 'url(#glyphGlowRed)' : 'none'}
                />

                {/* Red Record Dot in Upper Right (recording telemetry) */}
                {glyphActive && (
                  <circle cx="178" cy="40" r="2.5" fill="#e50914" className="animate-pulse" />
                )}
              </svg>

              {/* Foreground interactive telemetry tags on the transparent glass */}
              <div className="relative z-10 mt-auto pt-2 text-center pointer-events-none">
                <span className="text-[9px] font-mono text-red-500 font-bold uppercase tracking-wider block">
                  GLYPH FUEL METER: {(fuelProgress * 100).toFixed(0)}%
                </span>
                <span className="text-[8px] font-mono text-slate-400 block mt-0.5">
                  AERO COIL INTENSITY: {(coilIntensity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
