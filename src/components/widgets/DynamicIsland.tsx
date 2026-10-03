'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface DynamicIslandProps {
  vehicleName?: string;
  efficiencyValue?: number;
  efficiencyUnit?: string;
  speed?: number;
  fuelRate?: number;
  costPerKm?: number;
  className?: string;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  vehicleName = 'Tata Nexon Diesel',
  efficiencyValue = 18.2,
  efficiencyUnit = 'km/L',
  speed = 90,
  fuelRate = 5.49,
  costPerKm = 5.22,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`z-50 transition-all duration-300 ${className || 'fixed top-1.5 left-1/2 -translate-x-1/2'}`}>
      <div
        onClick={() => setExpanded(!expanded)}
        className={`dynamic-island transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
          expanded
            ? 'w-[90vw] max-w-[480px] p-6 pt-5 rounded-[32px] bg-black/95 backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
            : 'h-10 px-4 py-2 flex items-center gap-3.5 bg-black/90 hover:bg-black hover:scale-105 shadow-[0_12px_30px_rgba(0,0,0,0.7)]'
        }`}
      >
        {!expanded ? (
          // Compact Dynamic Island Pill
          <div className="flex items-center justify-between w-full gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
              <span className="font-semibold text-white tracking-wide truncate max-w-[130px]">
                {vehicleName}
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-emerald-400">{efficiencyValue.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal">{efficiencyUnit}</span>
              <span className="text-white/25">|</span>
              <span className="text-cyan-400">{speed} km/h</span>
            </div>
          </div>
        ) : (
          // Expanded iOS Live Activity View
          <div className="flex flex-col gap-4 text-left" onClick={(e) => e.stopPropagation()}>
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  LIVE TRIP ACTIVITY
                </span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-slate-300 transition-colors"
                title="Collapse"
              >
                ✕
              </button>
            </div>

            {/* Vehicle & Core Telemetry */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">ACTIVE PROFILE</span>
                <h4 className="text-base font-bold text-white tracking-tight">{vehicleName}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">ESTIMATED YIELD</span>
                <div className="text-xl font-ndot font-bold text-emerald-400">
                  {efficiencyValue.toFixed(1)}{' '}
                  <span className="text-xs text-slate-400 font-mono">{efficiencyUnit}</span>
                </div>
              </div>
            </div>

            {/* 3 Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-400">SPEED</span>
                <span className="text-sm font-ndot font-bold text-white mt-0.5">{speed} km/h</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-400">FUEL BURN</span>
                <span className="text-sm font-ndot font-bold text-red-400 mt-0.5">{fuelRate.toFixed(2)} L/100km</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-400">COST RATE</span>
                <span className="text-sm font-ndot font-bold text-amber-400 mt-0.5">₹{costPerKm.toFixed(2)}/km</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <Link
                href="/plan"
                onClick={() => setExpanded(false)}
                className="flex-1 py-2 px-3 text-center rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-medium text-white transition-colors"
              >
                Plan Route →
              </Link>
              <Link
                href="/compare"
                onClick={() => setExpanded(false)}
                className="flex-1 py-2 px-3 text-center rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono font-semibold text-white transition-colors shadow-[0_4px_15px_rgba(220,38,38,0.4)]"
              >
                Compare Fleet
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
