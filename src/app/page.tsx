'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Gauge,
  Navigation,
  GitCompare,
  Sliders,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Database,
  BarChart3,
  Cpu,
  Check,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  predictFuelConsumption,
  calculateTripCost,
  POPULATION_BASELINE_COEFFICIENTS,
  TripInput,
} from '@/lib/fuelModel';

export default function LandingPage() {
  // Interactive Live Formula Explorer State
  const [distanceKm, setDistanceKm] = useState(50);
  const [baseMileageKmPerL, setBaseMileageKmPerL] = useState(16);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(65);
  const [trafficIntensity, setTrafficIntensity] = useState(0.4);
  const [loadRatio, setLoadRatio] = useState(0.3);
  const [aggressiveFactor, setAggressiveFactor] = useState(0.5);
  const [gradientPercent, setGradientPercent] = useState(1.5);
  const [idleMinutes, setIdleMinutes] = useState(8);
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState(102.5);

  // Compute live breakdown using pure fuelModel engine
  const calculation = useMemo(() => {
    try {
      const input: TripInput = {
        distanceKm,
        baseMileageKmPerL,
        avgSpeedKmh,
        trafficIntensity,
        loadRatio,
        aggressiveFactor,
        gradientDecimal: gradientPercent / 100,
        idleMinutes,
      };
      const pred = predictFuelConsumption(input, POPULATION_BASELINE_COEFFICIENTS);
      const cost = calculateTripCost(pred, distanceKm, fuelPricePerLitre, 'INR');
      return { pred, cost, valid: true };
    } catch {
      return { pred: null, cost: null, valid: false };
    }
  }, [
    distanceKm,
    baseMileageKmPerL,
    avgSpeedKmh,
    trafficIntensity,
    loadRatio,
    aggressiveFactor,
    gradientPercent,
    idleMinutes,
    fuelPricePerLitre,
  ]);

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#1f2e45] bg-gradient-to-b from-[#0e1626] via-[#090d16] to-[#090d16] pt-16 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-6 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Mathematical Ground Truth • No Simulated Data</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
            Predict Real Trip Fuel & Costs.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Calibrated to Your Driving.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-300 sm:text-lg">
            Manufacturer ARAI / EPA figures assume lab dynos. FuelWise uses a mathematically
            grounded aerodynamic, load, gradient, and traffic model — calibrated directly against your
            own logged trips via Ordinary Least Squares regression.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/plan"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all hover:scale-[1.02]"
            >
              <Navigation className="h-4 w-4" />
              Plan a Trip Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/trips/new"
              className="flex items-center gap-2 rounded-lg border border-[#1f2e45] bg-[#111827] px-6 py-3 text-sm font-semibold text-gray-200 hover:bg-[#1a2333] hover:text-white transition-all"
            >
              <Activity className="h-4 w-4 text-cyan-400" />
              Log Driving Telemetry
            </Link>
            <Link
              href="/calibration"
              className="flex items-center gap-2 rounded-lg border border-[#1f2e45] bg-[#111827] px-6 py-3 text-sm font-semibold text-gray-200 hover:bg-[#1a2333] hover:text-white transition-all"
            >
              <Sliders className="h-4 w-4 text-emerald-400" />
              View OLS Regression
            </Link>
          </div>

          {/* Key Principles Checklist */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Real OLS Matrix Regression</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>OSRM Live Routing Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Open-Elevation Topography Sampling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Zero Fabricated Benchmarks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Mathematical Formula Explorer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2e45] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
                  LIVE CALCULATION ENGINE
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  [Population Engineering Baseline]
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
                The FuelWise Multi-Factor Physical Model
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Adjust any parameter below to see the exact formula terms recalculate in real time.
              </p>
            </div>

            {/* LaTeX Mathematical Formula Display */}
            <div className="rounded-lg border border-[#1f2e45] bg-[#090d16] p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
              F = (D / M₀) · (1 + kᵥ·V² + kₜ·T + kₗ·L + kₐ·A + k_g·G) + kᵢ·t_idle
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Interactive Inputs */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Distance Slider */}
              <div className="rounded-xl border border-[#1f2e45] bg-[#0b101b] p-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Distance (D)</span>
                  <span className="text-emerald-400 font-mono font-bold">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Base Mileage M0 */}
              <div className="rounded-xl border border-[#1f2e45] bg-[#0b101b] p-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Base Ideal Mileage (M₀)</span>
                  <span className="text-cyan-400 font-mono font-bold">{baseMileageKmPerL} km/L</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="35"
                  step="0.5"
                  value={baseMileageKmPerL}
                  onChange={(e) => setBaseMileageKmPerL(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Average Speed V */}
              <div className="rounded-xl border border-[#1f2e45] bg-[#0b101b] p-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Average Speed (V)</span>
                  <span className="text-emerald-400 font-mono font-bold">{avgSpeedKmh} km/h</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="140"
                  step="5"
                  value={avgSpeedKmh}
                  onChange={(e) => setAvgSpeedKmh(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-gray-500">Aerodynamic drag scales quadratically (V²)</span>
              </div>

              {/* Traffic Intensity T */}
              <div className="rounded-xl border border-[#1f2e45] bg-[#0b101b] p-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Traffic Intensity (T)</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {(trafficIntensity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={trafficIntensity}
                  onChange={(e) => setTrafficIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-gray-500">0 = Open Highway, 1.0 = Gridlock</span>
              </div>

              {/* Load Ratio L */}
              <div className="rounded-xl border border-[#1f2e45] bg-[#0b101b] p-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Payload Load Ratio (L)</span>
                  <span className="text-blue-400 font-mono font-bold">
                    {(loadRatio * 100).toFixed(0)}% rated
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={loadRatio}
                  onChange={(e) => setLoadRatio(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Road Gradient G */}
              <div className="rounded-xl border border-[#1f2e45] bg-[#0b101b] p-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Road Gradient (G)</span>
                  <span className="text-purple-400 font-mono font-bold">
                    {gradientPercent > 0 ? `+${gradientPercent}%` : `${gradientPercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="6"
                  step="0.5"
                  value={gradientPercent}
                  onChange={(e) => setGradientPercent(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Idle Time */}
              <div className="rounded-xl border border-[#1f2e45] bg-[#0b101b] p-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Idling Time (t_idle)</span>
                  <span className="text-red-400 font-mono font-bold">{idleMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={idleMinutes}
                  onChange={(e) => setIdleMinutes(Number(e.target.value))}
                  className="w-full accent-red-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Fuel Price */}
              <div className="rounded-xl border border-[#1f2e45] bg-[#0b101b] p-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Fuel Price (P)</span>
                  <span className="text-yellow-400 font-mono font-bold">₹{fuelPricePerLitre}/L</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="130"
                  step="0.5"
                  value={fuelPricePerLitre}
                  onChange={(e) => setFuelPricePerLitre(Number(e.target.value))}
                  className="w-full accent-yellow-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Right Column: Computed Outputs & Breakdown Card */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#1f2e45] bg-[#090d16] p-6 shadow-inner">
              <div>
                <div className="flex items-center justify-between border-b border-[#1f2e45] pb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Prediction Summary
                  </span>
                  <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Computed Outputs
                  </span>
                </div>

                {calculation.valid && calculation.pred && calculation.cost ? (
                  <>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {/* Total Fuel */}
                      <div className="rounded-lg border border-[#1f2e45] bg-[#111827] p-4">
                        <span className="text-xs text-gray-400">Total Fuel Consumed</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-white">
                            {calculation.pred.totalFuelLiters.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">Litres</span>
                        </div>
                      </div>

                      {/* Total Cost */}
                      <div className="rounded-lg border border-[#1f2e45] bg-[#111827] p-4">
                        <span className="text-xs text-gray-400">Estimated Cost</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-emerald-400">
                            ₹{calculation.cost.totalCost.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Effective Mileage */}
                      <div className="rounded-lg border border-[#1f2e45] bg-[#111827] p-4">
                        <span className="text-xs text-gray-400">Real Trip Mileage</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-cyan-300">
                            {calculation.pred.effectiveMileageKmPerL.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">km/L</span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          vs M₀ ideal ({baseMileageKmPerL} km/L)
                        </span>
                      </div>

                      {/* Cost per km */}
                      <div className="rounded-lg border border-[#1f2e45] bg-[#111827] p-4">
                        <span className="text-xs text-gray-400">Cost per km</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-amber-300">
                            ₹{calculation.cost.costPerKm.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">/km</span>
                        </div>
                      </div>
                    </div>

                    {/* What's Driving This Number Waterfall Breakdown */}
                    <div className="mt-6 border-t border-[#1f2e45] pt-4">
                      <span className="text-xs font-semibold text-gray-300 tracking-wider">
                        Factor Decomposition Breakdown
                      </span>
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-gray-300">
                          <span>Base Fuel (D / M₀)</span>
                          <span className="font-mono text-gray-200">
                            {calculation.pred.baseFuelLiters.toFixed(2)} L
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>+ Speed Drag Penalty (kv·V²)</span>
                          <span className="font-mono">
                            +{calculation.pred.speedTermLiters.toFixed(2)} L
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-amber-400">
                          <span>+ Traffic Stop-and-Go (kt·T)</span>
                          <span className="font-mono">
                            +{calculation.pred.trafficTermLiters.toFixed(2)} L
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-blue-400">
                          <span>+ Payload Resistance (kl·L)</span>
                          <span className="font-mono">
                            +{calculation.pred.loadTermLiters.toFixed(2)} L
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-purple-400">
                          <span>+ Road Incline (kg·G)</span>
                          <span className="font-mono">
                            {calculation.pred.gradientTermLiters >= 0 ? '+' : ''}
                            {calculation.pred.gradientTermLiters.toFixed(2)} L
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-red-400">
                          <span>+ Idling Consumption (ki·t_idle)</span>
                          <span className="font-mono">
                            +{calculation.pred.idleTermLiters.toFixed(2)} L
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-6 text-sm text-red-400">Invalid input parameters</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#1f2e45]">
                <Link
                  href="/plan"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                >
                  Plan Route with Live Map & OSRM
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & How It Works Steps */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The 4-Step Personal Calibration Journey
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            From generic population defaults to your car's personal aerodynamic and traffic signature.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-6 flex flex-col justify-between">
            <div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-sm border border-emerald-500/20 mb-4">
                01
              </span>
              <h3 className="text-base font-semibold text-white">Add Vehicle Profile</h3>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Enter your vehicle's make, model, base ideal mileage (M₀ in km/L), and rated payload in kg.
              </p>
            </div>
            <span className="mt-4 text-[11px] text-emerald-400 font-mono">
              [Population Baseline Active]
            </span>
          </div>

          <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-6 flex flex-col justify-between">
            <div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold text-sm border border-cyan-500/20 mb-4">
                02
              </span>
              <h3 className="text-base font-semibold text-white">Log Driving Trips</h3>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Log real trips manually or run the companion in-browser GPS & accelerometer tracker to measure real driving.
              </p>
            </div>
            <span className="mt-4 text-[11px] text-cyan-400 font-mono">
              [Trip Logs Stored in SQL]
            </span>
          </div>

          <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-6 flex flex-col justify-between">
            <div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 font-mono font-bold text-sm border border-purple-500/20 mb-4">
                03
              </span>
              <h3 className="text-base font-semibold text-white">Automatic OLS Calibration</h3>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Upon reaching ≥8 trips, our Ordinary Least Squares engine runs multiple linear regression, holding out 20% for test validation.
              </p>
            </div>
            <span className="mt-4 text-[11px] text-purple-400 font-mono">
              [R², MAE, MAPE Evaluated]
            </span>
          </div>

          <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-6 flex flex-col justify-between">
            <div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-sm border border-amber-500/20 mb-4">
                04
              </span>
              <h3 className="text-base font-semibold text-white">Plan & Optimize</h3>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Predict fuel and cost for any future route with pinpoint accuracy. Compare routes, payloads, and departure times side by side.
              </p>
            </div>
            <span className="mt-4 text-[11px] text-amber-400 font-mono">
              [Custom Calibrated Model]
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
