'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GitCompare,
  TrendingDown,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  predictFuelConsumption,
  calculateTripCost,
  POPULATION_BASELINE_COEFFICIENTS,
  TripInput,
} from '@/lib/fuelModel';
import { MacOSWindowChrome } from '@/components/widgets/MacOSWindowChrome';

interface Vehicle {
  id: string;
  name: string;
  m0: number;
  isCalibrated: boolean;
  activeCoefficients: any;
}

interface Scenario {
  name: string;
  distanceKm: number;
  avgSpeedKmh: number;
  trafficIntensity: number;
  loadRatio: number;
  aggressiveFactor: number;
  gradientPercent: number;
  idleMinutes: number;
}

export default function ComparePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [fuelPrice] = useState(102.5);

  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      name: 'Rush Hour Highway',
      distanceKm: 120,
      avgSpeedKmh: 105,
      trafficIntensity: 0.7,
      loadRatio: 0.8,
      aggressiveFactor: 0.9,
      gradientPercent: 1.0,
      idleMinutes: 15,
    },
    {
      name: 'Calm Off-Peak Drive',
      distanceKm: 120,
      avgSpeedKmh: 75,
      trafficIntensity: 0.2,
      loadRatio: 0.3,
      aggressiveFactor: 0.2,
      gradientPercent: 1.0,
      idleMinutes: 4,
    },
    {
      name: 'Scenic Country Route',
      distanceKm: 135,
      avgSpeedKmh: 60,
      trafficIntensity: 0.3,
      loadRatio: 0.4,
      aggressiveFactor: 0.3,
      gradientPercent: 2.2,
      idleMinutes: 6,
    },
  ]);

  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        const vList = data.vehicles || [];
        setVehicles(vList);
        if (vList.length > 0) setSelectedVehicleId(vList[0].id);
      })
      .catch(console.error);
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const activeCoeffs = selectedVehicle?.activeCoefficients || POPULATION_BASELINE_COEFFICIENTS;
  const m0 = selectedVehicle?.m0 || 16.0;

  const evaluatedScenarios = useMemo(() => {
    return scenarios.map((s) => {
      const input: TripInput = {
        distanceKm: s.distanceKm,
        baseMileageKmPerL: m0,
        avgSpeedKmh: s.avgSpeedKmh,
        trafficIntensity: s.trafficIntensity,
        loadRatio: s.loadRatio,
        aggressiveFactor: s.aggressiveFactor,
        gradientDecimal: s.gradientPercent / 100,
        idleMinutes: s.idleMinutes,
      };

      const pred = predictFuelConsumption(input, {
        kv: activeCoeffs.kv, kt: activeCoeffs.kt, kl: activeCoeffs.kl,
        ka: activeCoeffs.ka, kg: activeCoeffs.kg, ki: activeCoeffs.ki,
      });
      const cost = calculateTripCost(pred, s.distanceKm, fuelPrice, 'INR');
      return { ...s, pred, cost };
    });
  }, [scenarios, m0, activeCoeffs, fuelPrice]);

  const updateScenario = (index: number, field: keyof Scenario, value: any) => {
    setScenarios((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const bestScenario = useMemo(() => {
    if (evaluatedScenarios.length === 0) return null;
    return [...evaluatedScenarios].sort((a, b) => a.cost.totalCost - b.cost.totalCost)[0];
  }, [evaluatedScenarios]);

  const worstScenario = useMemo(() => {
    if (evaluatedScenarios.length === 0) return null;
    return [...evaluatedScenarios].sort((a, b) => b.cost.totalCost - a.cost.totalCost)[0];
  }, [evaluatedScenarios]);

  const maxSavings = worstScenario && bestScenario ? {
    fuel: worstScenario.pred.totalFuelLiters - bestScenario.pred.totalFuelLiters,
    cost: worstScenario.cost.totalCost - bestScenario.cost.totalCost,
    worstName: worstScenario.name,
    bestName: bestScenario.name,
  } : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* visionOS & macOS 27 Window Header */}
      <div className="visionos-window overflow-hidden mb-8">
        <MacOSWindowChrome
          title="Scenario Lab"
          subtitle="macOS 27 System Chrome • Fleet Multi-Condition Profiler"
        />
        <div className="p-6 sm:p-8">
          <div className="visionos-grab-bar" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/12 border border-cyan-400/25 px-3 py-0.5 text-[11px] font-semibold text-cyan-300">
                <Sparkles className="h-3 w-3" />
                visionOS Multi-Scenario Comparison
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <GitCompare className="h-7 w-7 text-cyan-400" />
              Scenario Lab & Savings Analyzer
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Simulate multiple driving speeds, highway congestion, and payloads simultaneously to isolate monetary savings.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div className="w-full sm:w-72">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full visionos-input cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#0b101d] text-white">
                    {v.name} ({v.m0} km/L baseline)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Savings Highlight Banner in visionOS Glass */}
      {maxSavings && maxSavings.fuel > 0.1 && (
        <div className="visionos-window mb-8 p-5 bg-gradient-to-r from-emerald-500/10 via-white/[0.04] to-cyan-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Potential Savings: ₹{maxSavings.cost.toFixed(0)} and {maxSavings.fuel.toFixed(1)} Litres
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Driving <strong className="text-emerald-300 font-semibold">{maxSavings.bestName}</strong> instead of{' '}
                  <strong className="text-rose-400 font-semibold">{maxSavings.worstName}</strong> cuts fuel burn by{' '}
                  {((maxSavings.cost / worstScenario!.cost.totalCost) * 100).toFixed(0)}%.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-400/30 whitespace-nowrap shadow-sm">
              {((maxSavings.cost / worstScenario!.cost.totalCost) * 100).toFixed(0)}% Cheaper
            </span>
          </div>
        </div>
      )}

      {/* Scenario Cards in visionOS Spatial Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {evaluatedScenarios.map((sc, index) => {
          const isWinner = bestScenario?.name === sc.name;
          return (
            <div
              key={index}
              className={`visionos-window flex flex-col justify-between p-6 transition-all ${
                isWinner
                  ? 'border-emerald-400/40 ring-2 ring-emerald-400/30 shadow-emerald-500/15'
                  : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-4 border-b border-white/[0.08]">
                  <input
                    type="text"
                    value={sc.name}
                    onChange={(e) => updateScenario(index, 'name', e.target.value)}
                    className="w-full bg-transparent font-bold text-base text-white focus:outline-none"
                  />
                  {isWinner && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30 uppercase tracking-wide">
                      <Trophy className="h-3 w-3" />
                      Lowest Cost
                    </span>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                  <div className="visionos-panel p-3">
                    <span className="text-[10px] text-slate-400 block font-medium">Fuel Required</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">
                      {sc.pred.totalFuelLiters.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Litres</span>
                  </div>

                  <div className="visionos-panel p-3">
                    <span className="text-[10px] text-slate-400 block font-medium">Trip Expense</span>
                    <span className="text-xl font-extrabold text-emerald-400 glow-green font-mono mt-1 block">
                      ₹{sc.cost.totalCost.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">at ₹{fuelPrice}/L</span>
                  </div>

                  <div className="visionos-panel p-2.5">
                    <span className="text-[10px] text-slate-400 block">Real Mileage</span>
                    <span className="text-sm font-bold text-cyan-300 font-mono mt-0.5 block">
                      {sc.pred.effectiveMileageKmPerL.toFixed(1)} km/L
                    </span>
                  </div>

                  <div className="visionos-panel p-2.5">
                    <span className="text-[10px] text-slate-400 block">Cost / km</span>
                    <span className="text-sm font-bold text-amber-300 font-mono mt-0.5 block">
                      ₹{sc.cost.costPerKm.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-6 space-y-3.5 text-xs border-t border-white/[0.08] pt-4">
                  <SliderRow
                    label="Distance"
                    value={`${sc.distanceKm} km`}
                    min={10} max={300} step={5} current={sc.distanceKm}
                    onChange={(v) => updateScenario(index, 'distanceKm', v)}
                  />
                  <SliderRow
                    label="Speed"
                    value={`${sc.avgSpeedKmh} km/h`}
                    min={20} max={130} step={5} current={sc.avgSpeedKmh}
                    onChange={(v) => updateScenario(index, 'avgSpeedKmh', v)}
                    className="slider-cyan"
                  />
                  <SliderRow
                    label="Traffic"
                    value={`${(sc.trafficIntensity * 100).toFixed(0)}%`}
                    min={0} max={1} step={0.05} current={sc.trafficIntensity}
                    onChange={(v) => updateScenario(index, 'trafficIntensity', v)}
                    className="slider-amber"
                  />
                  <SliderRow
                    label="Payload"
                    value={`${(sc.loadRatio * 100).toFixed(0)}%`}
                    min={0} max={1} step={0.05} current={sc.loadRatio}
                    onChange={(v) => updateScenario(index, 'loadRatio', v)}
                    className="slider-purple"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] mb-1 font-medium">Aggression (events/km)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={sc.aggressiveFactor}
                        onChange={(e) => updateScenario(index, 'aggressiveFactor', Number(e.target.value))}
                        className="w-full visionos-input font-mono text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] mb-1 font-medium">Idling (mins)</span>
                      <input
                        type="number"
                        min="0"
                        value={sc.idleMinutes}
                        onChange={(e) => updateScenario(index, 'idleMinutes', Number(e.target.value))}
                        className="w-full visionos-input font-mono text-xs py-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="mt-5 border-t border-white/[0.08] pt-3 text-[11px] space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Highway Cruising</span>
                    <span className="font-mono text-slate-300">{sc.pred.baseFuelLiters.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Speed Aero Drag (V²)</span>
                    <span className="font-mono font-medium">+{sc.pred.speedTermLiters.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Traffic Friction</span>
                    <span className="font-mono font-medium">+{sc.pred.trafficTermLiters.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>Payload Drag</span>
                    <span className="font-mono font-medium">+{sc.pred.loadTermLiters.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Idle Fuel Burn</span>
                    <span className="font-mono font-medium">+{sc.pred.idleTermLiters.toFixed(2)} L</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
  className = '',
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-white font-medium bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full text-[10px]">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${className}`}
      />
    </div>
  );
}
