'use client';

import React, { useEffect, useState } from 'react';
import { DotMatrixText } from './DotMatrixDisplay';

/* ═══════════════════════════════════════════════════════
   1. Nothing Analog Dial Clock (As seen in Nothing 2.0 Figma)
   ═══════════════════════════════════════════════════════ */
export const NothingAnalogClock: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secDeg = (seconds / 60) * 360;
  const minDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hrDeg = (hours / 12) * 360 + (minutes / 60) * 30;

  // 12 ticks around clock perimeter
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div
      className={`nothing-circle-widget relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="w-full h-full p-2"
      >
        {/* Outer subtle ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        
        {/* Perimeter ticks */}
        {ticks.map((deg, idx) => {
          const isMajor = idx % 3 === 0;
          return (
            <line
              key={deg}
              x1="50"
              y1={isMajor ? "10" : "12"}
              x2="50"
              y2={isMajor ? "16" : "14"}
              stroke={isMajor ? "#ffffff" : "rgba(255, 255, 255, 0.35)"}
              strokeWidth={isMajor ? "2" : "1"}
              strokeLinecap="round"
              transform={`rotate(${deg} 50 50)`}
            />
          );
        })}

        {/* Hour Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="28"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          transform={`rotate(${hrDeg} 50 50)`}
        />

        {/* Minute Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="18"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${minDeg} 50 50)`}
        />

        {/* Nothing Signature Red Second Needle */}
        <line
          x1="50"
          y1="56"
          x2="50"
          y2="12"
          stroke="#e50914"
          strokeWidth="1.2"
          strokeLinecap="round"
          transform={`rotate(${secDeg} 50 50)`}
        />

        {/* Center Cap */}
        <circle cx="50" cy="50" r="3" fill="#e50914" />
        <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   2. Nothing Fuel Gauge Dial with Dot-Matrix Readout
   ═══════════════════════════════════════════════════════ */
interface NothingFuelGaugeProps {
  value: number; // e.g. 18.2
  min?: number;
  max?: number;
  unit: string;
  label: string;
  color?: string;
  size?: number;
  className?: string;
}

export const NothingFuelGauge: React.FC<NothingFuelGaugeProps> = ({
  value,
  min = 0,
  max = 35,
  unit,
  label,
  color = '#e50914',
  size = 150,
  className = '',
}) => {
  // Map value to -120 deg to +120 deg (240 deg sweep)
  const clamped = Math.max(min, Math.min(max, value));
  const ratio = (clamped - min) / (max - min);
  const angle = -120 + ratio * 240;

  // 17 ticks across arc
  const tickCount = 17;
  const tickAngles = Array.from({ length: tickCount }, (_, i) => -120 + (i / (tickCount - 1)) * 240);

  return (
    <div
      className={`nothing-circle-widget relative flex flex-col items-center justify-center p-3 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Arc ticks */}
        {tickAngles.map((deg, idx) => {
          const isMajor = idx % 4 === 0;
          const isActive = deg <= angle;
          return (
            <line
              key={deg}
              x1="50"
              y1={isMajor ? "10" : "12"}
              x2="50"
              y2={isMajor ? "16" : "14"}
              stroke={isActive ? (idx > tickCount - 4 ? '#e50914' : '#ffffff') : 'rgba(255, 255, 255, 0.15)'}
              strokeWidth={isMajor ? "2" : "1"}
              strokeLinecap="round"
              transform={`rotate(${deg} 50 50)`}
            />
          );
        })}

        {/* Needle pointer */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 50 50)`}
          style={{ transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Center pivot */}
        <circle cx="50" cy="50" r="3.5" fill="#14161b" stroke={color} strokeWidth="1.5" />
      </svg>

      {/* Center digital dot-matrix readout */}
      <div className="z-10 flex flex-col items-center mt-7">
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className="my-0.5">
          <DotMatrixText text={value.toFixed(1)} size="xs" activeColor="#ffffff" />
        </div>
        <span className="text-[8px] font-mono tracking-wider text-rose-500 font-bold">
          {unit}
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   3. Nothing Dynamic Dot-Matrix Fuel Equalizer
   (Shows real-time drag vs grade vs roll vs AC vs accel)
   ═══════════════════════════════════════════════════════ */
interface NothingEqualizerProps {
  levels: { label: string; value: number }[]; // value 0 to 1
  className?: string;
}

export const NothingEqualizer: React.FC<NothingEqualizerProps> = ({
  levels,
  className = '',
}) => {
  const dotRows = 6;

  return (
    <div className={`p-4 nothing-card flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="nothing-rec-dot" />
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase">
            Power Demand Grid
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 tracking-widest">
          PHYSICS FLOW
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3 pt-2">
        {levels.map((item, colIdx) => {
          const activeCount = Math.round(Math.max(0, Math.min(1, item.value)) * dotRows);
          return (
            <div key={colIdx} className="flex flex-col items-center gap-1.5">
              <div className="flex flex-col-reverse gap-1.5 p-1 bg-white/[0.03] rounded-full border border-white/5">
                {Array.from({ length: dotRows }).map((_, rIdx) => {
                  const isActive = rIdx < activeCount;
                  const isPeak = isActive && rIdx >= dotRows - 2;
                  return (
                    <div
                      key={rIdx}
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: isActive
                          ? isPeak
                            ? '#e50914'
                            : '#ffffff'
                          : 'rgba(255, 255, 255, 0.08)',
                        boxShadow: isActive
                          ? isPeak
                            ? '0 0 6px #e50914'
                            : '0 0 3px rgba(255, 255, 255, 0.4)'
                          : 'none',
                      }}
                    />
                  );
                })}
              </div>
              <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   4. Nothing Quick-Toggle 1x1 Circular / Squircle Button
   ═══════════════════════════════════════════════════════ */
interface NothingQuickToggleProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: string;
  className?: string;
}

export const NothingQuickToggle: React.FC<NothingQuickToggleProps> = ({
  label,
  icon,
  active,
  onClick,
  badge,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`group relative flex flex-col items-center justify-center p-3 rounded-[26px] border transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-zinc-900 border-red-500/60 shadow-[0_12px_30px_rgba(229,9,20,0.25)]'
          : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
      } ${className}`}
      style={{ minWidth: '76px', minHeight: '84px' }}
    >
      {/* Top right active dot or badge */}
      {badge && (
        <span className="absolute top-2 right-2 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">
          {badge}
        </span>
      )}
      {!badge && active && (
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#e50914]" />
      )}

      {/* Icon */}
      <div
        className={`text-xl mb-1.5 transition-transform group-hover:scale-110 ${
          active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
        }`}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className={`text-[10px] font-mono font-semibold tracking-wider uppercase text-center ${
          active ? 'text-red-400' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </button>
  );
};

/* ═══════════════════════════════════════════════════════
   5. Nothing Live Telemetry 2x2 Squircle Card
   ═══════════════════════════════════════════════════════ */
interface NothingLiveTelemetryCardProps {
  vehicleName: string;
  efficiencyValue: number;
  efficiencyUnit: string;
  fuelRate: number; // L/100km or L/hr
  costPerKm: number;
  speed: number;
  isSimulating?: boolean;
  className?: string;
}

export const NothingLiveTelemetryCard: React.FC<NothingLiveTelemetryCardProps> = ({
  vehicleName,
  efficiencyValue,
  efficiencyUnit,
  fuelRate,
  costPerKm,
  speed,
  isSimulating = true,
  className = '',
}) => {
  return (
    <div className={`nothing-card p-6 flex flex-col justify-between relative overflow-hidden bg-dot-matrix-fine ${className}`}>
      {/* Top Header bar with REC badge */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="nothing-rec-badge">
            <div className="nothing-rec-dot" />
            <span>LIVE TELEMETRY</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            OLS VALIDATED
          </span>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-300">
          {vehicleName}
        </span>
      </div>

      {/* Big Dot Matrix Efficiency Display */}
      <div className="my-5 relative z-10 flex items-baseline gap-3">
        <div>
          <DotMatrixText
            text={efficiencyValue.toFixed(1)}
            size="md"
            activeColor="#ffffff"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
            {efficiencyUnit}
          </span>
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">
            PREDICTED YIELD
          </span>
        </div>
      </div>

      {/* Grid of 3 Nothing Sub-metrics */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 relative z-10">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-400 uppercase">SPEED</span>
          <span className="text-sm font-ndot font-bold text-white mt-0.5">{speed} km/h</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-400 uppercase">BURN RATE</span>
          <span className="text-sm font-ndot font-bold text-red-400 mt-0.5">{fuelRate.toFixed(2)} L/100km</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-400 uppercase">UNIT COST</span>
          <span className="text-sm font-ndot font-bold text-emerald-400 mt-0.5">₹{costPerKm.toFixed(2)}/km</span>
        </div>
      </div>
    </div>
  );
};
