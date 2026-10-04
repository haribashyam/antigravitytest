'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { DynamicIsland } from './DynamicIsland';

export const MacOSMenuBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="macos-menu-bar w-full h-9 px-4 flex items-center justify-between z-50 select-none border-b border-white/[0.08] relative">
      {/* Left Menu Items */}
      <div className="flex items-center gap-4 text-xs font-medium">
        <Link href="/" className="flex items-center gap-2 group transition-colors">
          <div className="flex items-center justify-center w-4 h-4 rounded-md bg-zinc-950 border border-white/20 shadow-sm group-hover:border-red-500/50 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ff2a34] animate-pulse" />
          </div>
          <span className="font-bold tracking-tight text-white group-hover:text-red-400 font-nothing transition-colors">
            FuelWise
          </span>
        </Link>
        <span className="text-white/20">/</span>
        <div className="hidden lg:flex items-center gap-3 text-slate-300 text-[11px] font-mono">
          <Link href="/plan" className="hover:text-white transition-colors">Route</Link>
          <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
          <Link href="/calibration" className="hover:text-white transition-colors">OLS Engine</Link>
          <Link href="/vehicles" className="hover:text-white transition-colors">Fleet</Link>
        </div>
      </div>

      {/* Center Notch: Dynamic Island Automotive HUD */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1 z-50">
        <DynamicIsland className="relative top-0 left-0 translate-x-0" />
      </div>

      {/* Right System Tray */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
        {/* GPS Satellite lock */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span>GPS 10Hz</span>
        </div>

        <span className="hidden md:inline text-white/20">|</span>

        {/* Live OLS Matrix Link */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          <span>PHYSICS v2.4</span>
        </div>

        <span className="hidden sm:inline text-white/20">|</span>

        {/* Live Clock */}
        <div className="font-mono text-slate-200 font-semibold tracking-wide">
          {timeStr || '12:00:00 PM'}
        </div>
      </div>
    </header>
  );
};
