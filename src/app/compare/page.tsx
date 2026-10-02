'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GitCompare,
  TrendingDown,
  DollarSign,
  Fuel,
  Gauge,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Car,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  predictFuelConsumption,
  calculateTripCost,
  POPULATION_BASELINE_COEFFICIENTS,
  TripInput,
} from '@/lib/fuelModel';

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
  trafficIntensity: number; // 0 to 1
  loadRatio: number; // 0 to 1
  aggressiveFactor: number;
  gradientPercent: number;
  idleMinutes: number;
}

export default function ComparePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [fuelPrice, setFuelPrice] = useState(102.5);

  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      name: 'Scenario A: Aggressive Highway Rush',
      distanceKm: 120,
      avgSpeedKmh: 105,
      trafficIntensity: 0.7,
      loadRatio: 0.8,
      aggressiveFactor: 0.9,
      gradientPercent: 1.0,
      idleMinutes: 15,
    },
    {
      name: 'Scenario B: Eco Steady Off-Peak',
      distanceKm: 120,
      avgSpeedKmh: 75,
      trafficIntensity: 0.2,
      loadRatio: 0.3,
      aggressiveFactor: 0.2,
      gradientPercent: 1.0,
      idleMinutes: 4,
    },
    {
      name: 'Scenario C: Scenic Country Route',
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

  // Compute predictions for each scenario
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
        kv: activeCoeffs.kv,
        kt: activeCoeffs.kt,
        kl: activeCoeffs.kl,
        ka: activeCoeffs.ka,
        kg: activeCoeffs.kg,
        ki: activeCoeffs.ki,
      });

      const cost = calculateTripCost(pred, s.distanceKm, fuelPrice, 'INR');

      return {
        ...s,
        pred,
        cost,
      };
    });
  }, [scenarios, m0, activeCoeffs, fuelPrice]);

  const updateScenario = (index: number, field: keyof Scenario, value: any) => {
    setScenarios((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Find most economical scenario
  const bestScenario = useMemo(() => {
    if (evaluatedScenarios.length === 0) return null;
    return [...evaluatedScenarios].sort((a, b) => a.cost.totalCost - b.cost.totalCost)[0];
  }, [evaluatedScenarios]);

  const worstScenario = useMemo(() => {
    if (evaluatedScenarios.length === 0) return null;
    return [...evaluatedScenarios].sort((a, b) => b.cost.totalCost - a.cost.totalCost)[0];
  }, [evaluatedScenarios]);

  const maxSavings =
    worstScenario && bestScenario
      ? {
          fuel: worstScenario.pred.totalFuelLiters - bestScenario.pred.totalFuelLiters,
          cost: worstScenario.cost.totalCost - bestScenario.cost.totalCost,
          worstName: worstScenario.name,
          bestName: bestScenario.name,
        }
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2e45] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              MULTI-SCENARIO OPTIMIZATION
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            What-If Scenario Comparison
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Compare driving speeds, payload weights, departure times, and routes side by side using your vehicle's physical model.
          </p>
        </div>

        {/* Vehicle Selector */}
        {vehicles.length > 0 && (
          <div className="w-full sm:w-72">
            <label className="block text-[11px] text-gray-400 mb-1">Evaluating Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full rounded-lg border border-[#1f2e45] bg-[#111827] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (M₀: {v.m0} km/L)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Delta Savings Callout Banner */}
      {maxSavings && maxSavings.fuel > 0.1 && (
        <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-[#111827] to-[#090d16] p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Optimization Delta: Save {maxSavings.fuel.toFixed(2)} Litres & ₹{maxSavings.cost.toFixed(2)}
                </h3>
                <p className="text-xs text-gray-300">
                  Switching from <strong className="text-red-400">{maxSavings.worstName}</strong> to{' '}
                  <strong className="text-emerald-400">{maxSavings.bestName}</strong> reduces trip cost by{' '}
                  {((maxSavings.cost / worstScenario!.cost.totalCost) * 100).toFixed(1)}%.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 whitespace-nowrap self-start sm:self-auto">
              {((maxSavings.cost / worstScenario!.cost.totalCost) * 100).toFixed(1)}% Cost Reduction
            </span>
          </div>
        </div>
      )}

      {/* Side-by-Side Scenarios Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {evaluatedScenarios.map((sc, index) => {
          const isWinner = bestScenario?.name === sc.name;
          return (
            <div
              key={index}
              className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xl transition-all ${
                isWinner
                  ? 'border-emerald-500/60 bg-[#111e25] ring-1 ring-emerald-500/40'
                  : 'border-[#1f2e45] bg-[#111827]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-[#1f2e45] pb-4">
                  <input
                    type="text"
                    value={sc.name}
                    onChange={(e) => updateScenario(index, 'name', e.target.value)}
                    className="w-full bg-transparent font-bold text-base text-white focus:outline-none focus:border-b focus:border-emerald-500"
                  />
                  {isWinner && (
                    <span className="shrink-0 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40 uppercase">
                      Most Efficient
                    </span>
                  )}
                </div>

                {/* Primary Computed Outputs */}
                <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-3">
                    <span className="text-[11px] text-gray-400 block">Total Fuel</span>
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {sc.pred.totalFuelLiters.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Litres</span>
                  </div>

                  <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-3">
                    <span className="text-[11px] text-gray-400 block">Estimated Cost</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                      ₹{sc.cost.totalCost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-500 block">at ₹{fuelPrice}/L</span>
                  </div>

                  <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-2.5">
                    <span className="text-[10px] text-gray-400 block">Trip Mileage</span>
                    <span className="text-base font-bold text-cyan-300 font-mono">
                      {sc.pred.effectiveMileageKmPerL.toFixed(1)} km/L
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-2.5">
                    <span className="text-[10px] text-gray-400 block">Cost / km</span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      ₹{sc.cost.costPerKm.toFixed(2)}/km
                    </span>
                  </div>
                </div>

                {/* Editable Scenario Controls */}
                <div className="mt-6 space-y-3.5 text-xs border-t border-[#1f2e45] pt-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Distance</span>
                      <span className="font-mono text-white font-bold">{sc.distanceKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="5"
                      value={sc.distanceKm}
                      onChange={(e) => updateScenario(index, 'distanceKm', Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-gray-800 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Average Speed</span>
                      <span className="font-mono text-cyan-400 font-bold">{sc.avgSpeedKmh} km/h</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="130"
                      step="5"
                      value={sc.avgSpeedKmh}
                      onChange={(e) => updateScenario(index, 'avgSpeedKmh', Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1 bg-gray-800 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Traffic Congestion</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {(sc.trafficIntensity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sc.trafficIntensity}
                      onChange={(e) => updateScenario(index, 'trafficIntensity', Number(e.target.value))}
                      className="w-full accent-amber-500 h-1 bg-gray-800 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Payload Load Ratio</span>
                      <span className="font-mono text-blue-400 font-bold">
                        {(sc.loadRatio * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sc.loadRatio}
                      onChange={(e) => updateScenario(index, 'loadRatio', Number(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-gray-800 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Aggressiveness</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={sc.aggressiveFactor}
                        onChange={(e) => updateScenario(index, 'aggressiveFactor', Number(e.target.value))}
                        className="w-full rounded border border-[#1f2e45] bg-[#090d16] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Idling (min)</span>
                      <input
                        type="number"
                        min="0"
                        value={sc.idleMinutes}
                        onChange={(e) => updateScenario(index, 'idleMinutes', Number(e.target.value))}
                        className="w-full rounded border border-[#1f2e45] bg-[#090d16] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Term Decomposition Breakdown */}
                <div className="mt-5 border-t border-[#1f2e45] pt-3 text-[11px] space-y-1.5 text-gray-400">
                  <div className="flex justify-between">
                    <span>Base (D/M₀)</span>
                    <span className="font-mono text-gray-300">{sc.pred.baseFuelLiters.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Speed drag</span>
                    <span className="font-mono">+{sc.pred.speedTermLiters.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Traffic stop-go</span>
                    <span className="font-mono">+{sc.pred.trafficTermLiters.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>Payload</span>
                    <span className="font-mono">+{sc.pred.loadTermLiters.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Idle fuel</span>
                    <span className="font-mono">+{sc.pred.idleTermLiters.toFixed(2)} L</span>
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
