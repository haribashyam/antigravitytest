'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Car, ChevronDown, X, Navigation, GitCompare, Gauge, Fuel, Zap } from 'lucide-react';

interface DynamicIslandProps {
  vehicleName?: string;
  efficiencyValue?: number;
  efficiencyUnit?: string;
  speed?: number;
  fuelRate?: number;
  costPerKm?: number;
  className?: string;
}

interface VehicleInfo {
  id: string;
  name: string;
  make: string;
  model: string;
  fuelType: string;
  m0: number;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  vehicleName: propVehicleName = 'Tata Nexon Diesel',
  efficiencyValue: propEfficiency = 18.2,
  efficiencyUnit = 'km/L',
  speed = 90,
  fuelRate = 5.49,
  costPerKm = 5.22,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch real user vehicles if logged in
  const loadVehicles = () => {
    let headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fuelwise_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/vehicles', { headers })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.vehicles && data.vehicles.length > 0) {
          setVehicles(data.vehicles);
          setSelectedVehicle((prev) => prev || data.vehicles[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadVehicles();
    window.addEventListener('auth-state-changed', loadVehicles);
    return () => window.removeEventListener('auth-state-changed', loadVehicles);
  }, []);

  // Dismiss dropdown on click outside or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeName = selectedVehicle?.name || propVehicleName;
  const activeM0 = selectedVehicle?.m0 || propEfficiency;
  const activeFuelType = (selectedVehicle?.fuelType || 'diesel').toUpperCase();

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* ─── Compact Sleek Telemetry Pill (Fits seamlessly in Menu Bar) ─── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle automotive live telemetry HUD"
        className="dynamic-island h-7 px-3 py-1 flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] outline-none"
      >
        {/* Animated Combustion Red LED Dot */}
        <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500 shadow-[0_0_6px_#ef4444]" />
        </span>

        {/* Active Vehicle Title */}
        <span className="font-mono font-bold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 truncate max-w-[110px] sm:max-w-[145px]">
          {activeName}
        </span>

        {/* Metric Yield Chip */}
        <div className="flex items-center gap-1">
          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.2 rounded font-mono font-bold text-[11px] leading-tight">
            {activeM0.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-medium">
            {efficiencyUnit}
          </span>
        </div>

        {/* Divider */}
        <span className="text-zinc-300 dark:text-white/20 text-xs hidden sm:inline">|</span>

        {/* Speed Metric */}
        <span className="text-sky-700 dark:text-cyan-400 font-bold font-mono text-[11px] hidden sm:inline">
          {speed} km/h
        </span>

        {/* Micro Chevron Indicator */}
        <ChevronDown
          className={`h-3 w-3 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-red-500' : ''
          }`}
        />
      </button>

      {/* ─── Compact Refined Telemetry Popover HUD (Neat & Perfectly Proportioned) ─── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Automotive Live Telemetry HUD"
          className="dynamic-island-hud absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[345px] sm:w-[365px] max-w-[calc(100vw-24px)] rounded-2xl p-4 z-50 animate-fade-in-up shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200/80 dark:border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-600 dark:text-zinc-400 uppercase">
                AUTOMOTIVE TELEMETRY HUD
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 font-bold">
                OLS KERNEL
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                title="Close HUD"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Active Vehicle Profile */}
          <div className="mb-3 p-2.5 rounded-xl bg-zinc-100/80 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Car className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white font-mono leading-tight">
                    {activeName}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <span>{activeFuelType}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      M₀: {activeM0.toFixed(1)} {efficiencyUnit}
                    </span>
                  </div>
                </div>
              </div>

              {vehicles.length > 1 && (
                <select
                  value={selectedVehicle?.id || ''}
                  onChange={(e) => {
                    const found = vehicles.find((v) => v.id === e.target.value);
                    if (found) setSelectedVehicle(found);
                  }}
                  className="text-[11px] font-mono py-1 px-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-white/15 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Precision Telemetry Triad Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Tile 1: Fuel Yield */}
            <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                EST. YIELD
              </span>
              <div className="my-1">
                <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {activeM0.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 ml-0.5">
                  {efficiencyUnit}
                </span>
              </div>
              <div className="h-1 w-full bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.min(100, (activeM0 / 25) * 100)}%` }}
                />
              </div>
            </div>

            {/* Tile 2: Velocity & Drag */}
            <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                CRUISE SPEED
              </span>
              <div className="my-1">
                <span className="text-base font-extrabold font-mono text-sky-600 dark:text-cyan-400">
                  {speed}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 ml-0.5">
                  km/h
                </span>
              </div>
              <span className="text-[9px] font-mono text-red-600 dark:text-red-400 truncate">
                Aero V² Active
              </span>
            </div>

            {/* Tile 3: Running Cost */}
            <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                RUN COST
              </span>
              <div className="my-1">
                <span className="text-base font-extrabold font-mono text-amber-600 dark:text-amber-400">
                  ₹{costPerKm.toFixed(2)}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 ml-0.5">
                  /km
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                ₹102.5/L ref
              </span>
            </div>
          </div>

          {/* Physics Kernel Formula Summary Strip */}
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-100/60 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/5 mb-3 flex items-center justify-between text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>Burn: {fuelRate.toFixed(2)} L/100km</span>
            <span>•</span>
            <span>Idle loss: 0.10 L</span>
            <span>•</span>
            <span>Grade: +1.2%</span>
          </div>

          {/* Quick Actions (Compact & Useful) */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/plan"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition-colors shadow-sm shadow-red-600/30"
            >
              <Navigation className="h-3 w-3" />
              <span>Plan Trip</span>
            </Link>

            <Link
              href="/compare"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-200/90 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 text-zinc-900 dark:text-white font-mono font-semibold text-xs transition-colors"
            >
              <GitCompare className="h-3 w-3" />
              <span>Compare</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicIsland;
