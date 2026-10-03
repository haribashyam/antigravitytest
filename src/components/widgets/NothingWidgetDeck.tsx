'use client';

import React, { useState } from 'react';
import {
  NothingAnalogClock,
  NothingFuelGauge,
  NothingEqualizer,
  NothingQuickToggle,
  NothingLiveTelemetryCard,
} from './NothingWidgets';
import { DotMatrixText } from './DotMatrixDisplay';
import { Car, Wind, Mountain, Navigation, Compass, Shield, Zap } from 'lucide-react';

interface NothingWidgetDeckProps {
  onPresetSelect?: (preset: 'city' | 'highway' | 'mountain' | 'commute') => void;
  currentSpeed?: number;
  currentEfficiency?: number;
  fuelRate?: number;
  costPerKm?: number;
  dragLevel?: number;
  gradientLevel?: number;
  trafficLevel?: number;
  loadLevel?: number;
}

export const NothingWidgetDeck: React.FC<NothingWidgetDeckProps> = ({
  onPresetSelect,
  currentSpeed = 70,
  currentEfficiency = 16.5,
  fuelRate = 6.06,
  costPerKm = 6.21,
  dragLevel = 0.5,
  gradientLevel = 0.2,
  trafficLevel = 0.4,
  loadLevel = 0.35,
}) => {
  const [activeToggle, setActiveToggle] = useState<'city' | 'highway' | 'mountain' | 'commute'>('commute');
  const [ecoMode, setEcoMode] = useState(true);

  const handleToggle = (preset: 'city' | 'highway' | 'mountain' | 'commute') => {
    setActiveToggle(preset);
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  const equalizerLevels = [
    { label: 'AERO', value: dragLevel },
    { label: 'ROLL', value: 0.25 },
    { label: 'GRAD', value: gradientLevel },
    { label: 'TRAF', value: trafficLevel },
    { label: 'LOAD', value: loadLevel },
  ];

  return (
    <div className="w-full">
      {/* Deck Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_#e50914]" />
          <h3 className="text-lg font-bold font-nothing tracking-tight text-white flex items-center gap-2">
            Nothing OS 2.0 <span className="text-slate-400 font-mono text-xs font-normal">| Live Telemetry Deck</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            DOT MATRIX HYBRID
          </span>
          <div className="nothing-rec-badge">
            <div className="nothing-rec-dot" />
            <span>ACTIVE LINK</span>
          </div>
        </div>
      </div>

      {/* Modular Nothing Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Column 1: Analog Meter & Clock Stack (md:col-span-4) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          {/* Pair of 1x1 circular widgets: Fuel Meter & Clock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <NothingFuelGauge
                value={currentEfficiency}
                unit="KM/L"
                label="EFFICIENCY"
                color="#e50914"
                size={140}
              />
              <span className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-wider">
                Analog / Digital
              </span>
            </div>

            <div className="flex flex-col items-center">
              <NothingAnalogClock size={140} />
              <span className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-wider">
                System Chrono
              </span>
            </div>
          </div>

          {/* Nothing Red Accent Squircle Badge */}
          <div className="nothing-card-red p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-90">
                MONTHLY ECO YIELD
              </span>
              <div className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
            </div>
            <div className="my-3">
              <div className="text-2xl font-bold font-ndot tracking-tight">₹1,480 SAVED</div>
              <p className="text-[11px] font-mono opacity-80 mt-0.5">
                vs Uncalibrated Driving Style
              </p>
            </div>
            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-mono">
              <span>TRIP TOTAL</span>
              <span className="font-bold">428.5 KM</span>
            </div>
          </div>
        </div>

        {/* Column 2: 2x2 Squircle Live Telemetry Card (md:col-span-5) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <NothingLiveTelemetryCard
            vehicleName="Tata Nexon 1.5 Diesel"
            efficiencyValue={currentEfficiency}
            efficiencyUnit="KM/L"
            fuelRate={fuelRate}
            costPerKm={costPerKm}
            speed={currentSpeed}
            isSimulating={true}
          />

          {/* Power Demand Equalizer */}
          <NothingEqualizer levels={equalizerLevels} />
        </div>

        {/* Column 3: Quick Toggles & Tactile Controls (md:col-span-3) */}
        <div className="md:col-span-3 flex flex-col gap-4 justify-between">
          <div className="nothing-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                QUICK PROFILES
              </span>
              <span className="text-[9px] font-mono text-red-500 font-bold">1-TAP</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <NothingQuickToggle
                label="City Grid"
                icon={<Car className="h-4 w-4" />}
                active={activeToggle === 'city'}
                onClick={() => handleToggle('city')}
              />
              <NothingQuickToggle
                label="Expressway"
                icon={<Wind className="h-4 w-4" />}
                active={activeToggle === 'highway'}
                onClick={() => handleToggle('highway')}
              />
              <NothingQuickToggle
                label="Ghats"
                icon={<Mountain className="h-4 w-4" />}
                active={activeToggle === 'mountain'}
                onClick={() => handleToggle('mountain')}
              />
              <NothingQuickToggle
                label="Commute"
                icon={<Navigation className="h-4 w-4" />}
                active={activeToggle === 'commute'}
                onClick={() => handleToggle('commute')}
              />
            </div>
          </div>

          {/* Eco-Mode Tactile Pill */}
          <button
            type="button"
            onClick={() => setEcoMode(!ecoMode)}
            className={`w-full p-4 rounded-3xl border flex items-center justify-between transition-all cursor-pointer ${
              ecoMode
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_8px_25px_rgba(16,185,129,0.2)]'
                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  ecoMode ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Eco Optimizer</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {ecoMode ? 'Active (+12% MPG)' : 'Standard Map'}
                </span>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                ecoMode ? 'bg-emerald-500 justify-end' : 'bg-white/20 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
