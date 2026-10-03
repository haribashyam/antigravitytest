'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Fuel,
  Navigation,
  GitCompare,
  ArrowRight,
  TrendingDown,
  BarChart3,
  Sparkles,
  Zap,
  Shield,
  MapPin,
  Car,
  ChevronRight,
  Sliders,
  Compass,
  Waves,
} from 'lucide-react';
import {
  predictFuelConsumption,
  calculateTripCost,
  POPULATION_BASELINE_COEFFICIENTS,
  TripInput,
} from '@/lib/fuelModel';
import { SpatialGauge } from '@/components/visionOS/SpatialGauge';
import { MacOSWindowChrome } from '@/components/widgets/MacOSWindowChrome';
import { NothingEqualizer, NothingFuelGauge, NothingAnalogClock } from '@/components/widgets/NothingWidgets';
import { DotMatrixText } from '@/components/widgets/DotMatrixDisplay';
import PatternWaves from '@/components/PatternWaves/PatternWaves';

export default function LandingPage() {
  // PatternWaves Presets and Showcase State (Black, Grey, Red & White)
  const [showcasePreset, setShowcasePreset] = useState<'silk' | 'ocean' | 'pond' | 'lines' | 'terminal' | 'mesh'>('silk');
  const [showcaseColor, setShowcaseColor] = useState('#ffffff');
  const [showcaseBg, setShowcaseBg] = useState('#000000');
  const [showcaseFade, setShowcaseFade] = useState<'edges' | 'center' | 'bottom' | 'top' | 'none'>('edges');
  const [showcaseInteractive, setShowcaseInteractive] = useState(true);
  const [showcaseCursorStrength, setShowcaseCursorStrength] = useState(0.7);
  const [showcaseCursorSize, setShowcaseCursorSize] = useState(60);
  const [showcasePaused, setShowcasePaused] = useState(false);

  // Active preset tracker for Nothing OS tactile pill buttons
  const [activePreset, setActivePreset] = useState<'city' | 'highway' | 'mountain' | 'commute' | null>('highway');

  // Interactive Calculator State
  const [distanceKm, setDistanceKm] = useState(65);
  const [baseMileageKmPerL, setBaseMileageKmPerL] = useState(16.5);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(70);
  const [trafficIntensity, setTrafficIntensity] = useState(0.4);
  const [loadRatio, setLoadRatio] = useState(0.35);
  const [aggressiveFactor, setAggressiveFactor] = useState(0.4);
  const [gradientPercent, setGradientPercent] = useState(1.2);
  const [idleMinutes, setIdleMinutes] = useState(8);
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState(102.5);

  // Quick Preset Presets
  const applyPreset = (preset: 'city' | 'highway' | 'mountain' | 'commute') => {
    setActivePreset(preset);
    switch (preset) {
      case 'city':
        setDistanceKm(25);
        setAvgSpeedKmh(32);
        setTrafficIntensity(0.75);
        setIdleMinutes(18);
        setGradientPercent(0.2);
        break;
      case 'highway':
        setDistanceKm(180);
        setAvgSpeedKmh(95);
        setTrafficIntensity(0.15);
        setIdleMinutes(4);
        setGradientPercent(0.5);
        break;
      case 'mountain':
        setDistanceKm(80);
        setAvgSpeedKmh(48);
        setTrafficIntensity(0.3);
        setIdleMinutes(6);
        setGradientPercent(4.5);
        break;
      case 'commute':
        setDistanceKm(42);
        setAvgSpeedKmh(55);
        setTrafficIntensity(0.5);
        setIdleMinutes(12);
        setGradientPercent(1.0);
        break;
    }
  };

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
  }, [distanceKm, baseMileageKmPerL, avgSpeedKmh, trafficIntensity, loadRatio, aggressiveFactor, gradientPercent, idleMinutes, fuelPricePerLitre]);

  return (
    <div className="flex flex-col">
      {/* ═══════════ HERO SECTION (FLOATING OVER GLOBAL PATTERNWAVES) ═══════════ */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="animate-fade-in-up">
            {/* Nothing OS / VisionOS Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl px-4 py-1.5 text-xs font-mono text-zinc-300 mb-8 shadow-lg shadow-black/40">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/80" />
              <span>NOTHING OS 2.0 • FULL-SCREEN FLUID MATRIX</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.08] font-nothing">
              Know your real
              <br />
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                fuel costs
              </span>
              <span className="text-red-500">.</span>
              <br />
              before you drive.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-300/90 sm:text-lg leading-relaxed font-normal">
              Automotive-grade journey fuel predictions calibrated directly against your vehicle&apos;s real driving telemetry. 
              Zero guesswork, grounded in fluid dynamics and OLS regression.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/plan"
                className="visionos-pill-btn-primary py-3 px-6 text-sm"
              >
                <Navigation className="h-4 w-4" />
                <span>Plan a Spatial Journey</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/trips/new"
                className="visionos-pill-btn py-3 px-6 text-sm"
              >
                <Fuel className="h-4 w-4 text-red-400" />
                <span>Log Driving Telemetry</span>
              </Link>
            </div>

            {/* Nothing OS 2.0 Industrial Telemetry Chips */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-zinc-500">ENGINE:</span>
                <span className="text-white font-bold">OLS PHYSICS KERNEL</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-zinc-500">TELEMETRY:</span>
                <span className="text-white font-bold">DOT-MATRIX HYBRID</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-zinc-500">SURFACE:</span>
                <span className="text-white font-bold">60 FPS WEBGL2 WAKE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ LIVE visionOS SPATIAL CALCULATOR WINDOW ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full -mt-8 mb-24">
        <div className="visionos-window overflow-hidden">
          {/* macOS 27 Desktop Chrome Header */}
          <MacOSWindowChrome
            title="FuelWise Spatial Cockpit"
            subtitle="macOS 27 System Chrome • OLS Physics Kernel"
          />

          <div className="p-6 sm:p-10">
            {/* visionOS window top grab bar */}
            <div className="visionos-grab-bar" />

          {/* Window Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl font-nothing">
                      Interactive Physics Simulator
                    </h2>
                    <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      NOTHING 2.0 HYBRID COCKPIT
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Real-time quadratic aerodynamic drag ($V^2$), payload load ratio, grade gradient, and traffic friction.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Presets Ornament with Nothing OS Tactile Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 px-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                PRESETS:
              </span>
              {(['city', 'highway', 'mountain', 'commute'] as const).map((p) => {
                const labelMap = {
                  city: 'City Grid',
                  highway: 'Expressway',
                  mountain: 'Ghats/Incline',
                  commute: 'Commute',
                };
                const isActive = activePreset === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`px-3 py-1 text-[11px] font-mono rounded-full transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-600/30 border border-red-500'
                        : 'text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-transparent'
                    }`}
                  >
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    {labelMap[p]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sliders in visionOS Panels */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Distance */}
              <SliderCard label="Trip Distance" value={`${distanceKm} km`} color="emerald">
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={distanceKm}
                  onChange={(e) => {
                    setDistanceKm(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  className="w-full"
                />
              </SliderCard>

              {/* Base Mileage */}
              <SliderCard label="Base Rated Mileage (M₀)" value={`${baseMileageKmPerL} km/L`} color="cyan">
                <input
                  type="range"
                  min="8"
                  max="35"
                  step="0.5"
                  value={baseMileageKmPerL}
                  onChange={(e) => {
                    setBaseMileageKmPerL(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  className="w-full slider-cyan"
                />
              </SliderCard>

              {/* Average Speed */}
              <SliderCard label="Average Speed (V² Drag)" value={`${avgSpeedKmh} km/h`} color="emerald" hint="Quadratic aero penalty above 60 km/h">
                <input
                  type="range"
                  min="20"
                  max="140"
                  step="5"
                  value={avgSpeedKmh}
                  onChange={(e) => {
                    setAvgSpeedKmh(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  className="w-full"
                />
              </SliderCard>

              {/* Traffic */}
              <SliderCard label="Traffic Intensity (T)" value={`${(trafficIntensity * 100).toFixed(0)}%`} color="amber" hint="0% = Open Highway, 100% = Gridlock">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={trafficIntensity}
                  onChange={(e) => {
                    setTrafficIntensity(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  className="w-full slider-amber"
                />
              </SliderCard>

              {/* Passenger Load */}
              <SliderCard label="Payload Load Ratio (L)" value={`${(loadRatio * 100).toFixed(0)}%`} color="purple">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={loadRatio}
                  onChange={(e) => {
                    setLoadRatio(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  className="w-full slider-purple"
                />
              </SliderCard>

              {/* Road Incline */}
              <SliderCard label="Road Gradient (G)" value={`${gradientPercent > 0 ? '+' : ''}${gradientPercent}%`} color="purple">
                <input
                  type="range"
                  min="-4"
                  max="6"
                  step="0.5"
                  value={gradientPercent}
                  onChange={(e) => {
                    setGradientPercent(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  className="w-full slider-purple"
                />
              </SliderCard>

              {/* Idle Time */}
              <SliderCard label="Engine Idling (t_idle)" value={`${idleMinutes} min`} color="rose" hint="Signals, stops, AC runtime">
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={idleMinutes}
                  onChange={(e) => {
                    setIdleMinutes(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  className="w-full slider-rose"
                />
              </SliderCard>

              {/* Fuel Price */}
              <SliderCard label="Fuel Price (P)" value={`₹${fuelPricePerLitre}/L`} color="yellow">
                <input
                  type="range"
                  min="80"
                  max="130"
                  step="0.5"
                  value={fuelPricePerLitre}
                  onChange={(e) => {
                    setFuelPricePerLitre(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  className="w-full"
                />
              </SliderCard>
            </div>

            {/* Results Window Panel with visionOS & Nothing OS Hybrid Gauges */}
            <div className="lg:col-span-5 flex flex-col justify-between visionos-panel p-6 bg-dot-matrix-fine relative">
              {calculation.valid && calculation.pred && calculation.cost ? (
                <>
                  <div>
                    {/* Nothing REC Telemetry Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <div className="nothing-rec-badge">
                          <div className="nothing-rec-dot" />
                          <span>LIVE TELEMETRY</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                          OLS CALIBRATED
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        60 FPS REACTION
                      </span>
                    </div>

                    {/* Circular Spatial Gauges */}
                    <div className="mt-4 grid grid-cols-2 gap-2 bg-black/40 p-2 rounded-2xl border border-white/[0.08] backdrop-blur-md">
                      <SpatialGauge
                        value={calculation.pred.totalFuelLiters}
                        min={1}
                        max={35}
                        unit="Litres"
                        label="Total Fuel"
                        sublabel="Predicted Consumption"
                        color="emerald"
                        size={110}
                      />
                      <SpatialGauge
                        value={calculation.pred.effectiveMileageKmPerL}
                        min={5}
                        max={30}
                        unit="km / L"
                        label="Real Mileage"
                        sublabel={`vs ${baseMileageKmPerL} rated`}
                        color="cyan"
                        size={110}
                      />
                    </div>

                    {/* Nothing OS 2.0 Dot Matrix Metrics Cards */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Real Mileage</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        </div>
                        <div className="flex items-baseline gap-1.5 my-1">
                          <DotMatrixText
                            text={calculation.pred.effectiveMileageKmPerL.toFixed(1)}
                            size="sm"
                            activeColor="#ffffff"
                          />
                          <span className="text-xs font-mono font-bold text-red-400">km/L</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          rated: {baseMileageKmPerL} km/L
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Estimated Cost</span>
                          <span className="text-[10px] font-mono text-amber-400">₹{calculation.cost.costPerKm.toFixed(2)}/km</span>
                        </div>
                        <div className="flex items-baseline gap-1 my-1">
                          <span className="text-base font-bold font-mono text-white">₹</span>
                          <DotMatrixText
                            text={calculation.cost.totalCost.toFixed(0)}
                            size="sm"
                            activeColor="#ff2a34"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {calculation.pred.totalFuelLiters.toFixed(1)} L fuel pumped
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Nothing Dot-Matrix Power Demand Grid (Equalizer) */}
                    <div className="mt-4">
                      <NothingEqualizer
                        className="bg-black/70 border-white/10"
                        levels={[
                          { label: 'Aero V²', value: Math.min(1, Math.pow(avgSpeedKmh / 120, 2)) },
                          { label: 'Grade', value: Math.min(1, Math.max(0, (gradientPercent + 4) / 10)) },
                          { label: 'Traffic', value: trafficIntensity },
                          { label: 'Payload', value: loadRatio },
                          { label: 'Idle AC', value: Math.min(1, idleMinutes / 30) },
                        ]}
                      />
                    </div>

                    {/* Physics Breakdown */}
                    <div className="mt-4 pt-3 border-t border-white/[0.08]">
                      <span className="text-xs font-mono font-semibold text-zinc-300 mb-2 block tracking-wider uppercase">
                        // Friction Loss Breakdown
                      </span>
                      <div className="space-y-1.5 text-xs font-mono">
                        <BreakdownRow label="Base Highway Cruising" value={`${calculation.pred.baseFuelLiters.toFixed(2)} L`} color="text-zinc-300" />
                        <BreakdownRow label="Aerodynamic Drag (V²)" value={`+${calculation.pred.speedTermLiters.toFixed(2)} L`} color="text-red-400" />
                        <BreakdownRow label="Traffic Congestion" value={`+${calculation.pred.trafficTermLiters.toFixed(2)} L`} color="text-amber-400" />
                        <BreakdownRow label="Payload & Passenger Weight" value={`+${calculation.pred.loadTermLiters.toFixed(2)} L`} color="text-zinc-200" />
                        <BreakdownRow label="Elevation Grade" value={`${calculation.pred.gradientTermLiters >= 0 ? '+' : ''}${calculation.pred.gradientTermLiters.toFixed(2)} L`} color="text-purple-400" />
                        <BreakdownRow label="Engine Idling Runtime" value={`+${calculation.pred.idleTermLiters.toFixed(2)} L`} color="text-rose-400" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.08]">
                    <Link
                      href="/plan"
                      className="w-full visionos-pill-btn-primary py-3 text-center justify-center text-xs font-mono font-semibold"
                    >
                      <span>Plan Route with Live Elevation</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="py-8 text-sm text-rose-400 text-center font-mono">Adjust inputs to calculate</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* ═══════════ HOW IT WORKS (visionOS & NOTHING OS 2.0 HYBRID) ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/60 border border-white/10 px-3.5 py-1 text-xs font-mono text-zinc-400 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>// 01 WORKFLOW ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-nothing">
            Four Steps to Mathematical Precision
          </h2>
          <p className="mt-3 text-zinc-400 text-sm font-mono">
            Moving beyond inaccurate window-sticker ratings with your personal driving calibration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StepCard
            step="01"
            icon={<Car className="h-5 w-5 text-zinc-200" />}
            title="Register Vehicle"
            description="Add your vehicle specification, rated baseline mileage M₀, and fuel grade."
          />
          <StepCard
            step="02"
            icon={<MapPin className="h-5 w-5 text-zinc-200" />}
            title="Log Journey Trips"
            description="Log trips with real GPS distance, average speed, traffic levels, and actual fuel pumped."
          />
          <StepCard
            step="03"
            icon={<BarChart3 className="h-5 w-5 text-zinc-200" />}
            title="OLS Calibration"
            description="At 8+ logged trips, our matrix engine solves regression coefficients specific to your driving style."
          />
          <StepCard
            step="04"
            icon={<Zap className="h-5 w-5 text-zinc-200" />}
            title="Spatial Predictions"
            description="Preview exact fuel quantities and rupee expenses for any route before starting the engine."
          />
        </div>
      </section>

      {/* ═══════════ REACT BITS PATTERNWAVES INTERACTIVE SHOWCASE ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="visionos-window overflow-hidden">
          <MacOSWindowChrome
            title="React Bits • <PatternWaves /> WebGL Dynamics Surface"
            subtitle="OpenGL ES 3.00 WebGL2 Shaders • 60 FPS Fluid Cursor Wake • Mathematical Fluid Simulation"
          />

          <div className="p-6 sm:p-8">
            <div className="visionos-grab-bar" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-red-500" />
                  <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl font-nothing">
                    &lt;PatternWaves /&gt; Fluid Surface
                  </h2>
                  <span className="text-[10px] font-mono uppercase bg-red-500/10 text-red-400 border border-red-500/25 px-2.5 py-0.5 rounded-full font-bold">
                    Nothing OS • React Bits
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-mono">
                  GLSL 3.00 ES fluid simulation in Black, Grey, Red & White. Move or click anywhere to send shockwave ripples and fiery red specular glints across the dot matrix surface.
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowcasePaused(!showcasePaused)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono border flex items-center gap-1.5 transition-all ${
                    showcasePaused
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : 'bg-white/[0.05] text-zinc-300 border-white/[0.1] hover:bg-white/[0.1]'
                  }`}
                >
                  {showcasePaused ? '▶ Resume Surface' : '⏸ Pause Surface'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowcaseInteractive(!showcaseInteractive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                    showcaseInteractive
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-500/20'
                      : 'bg-white/[0.05] text-zinc-400 border-white/[0.1]'
                  }`}
                >
                  {showcaseInteractive ? 'Cursor & Click Shockwave: ON' : 'Cursor Shockwave: OFF'}
                </button>
              </div>
            </div>

            {/* Presets and Attributes Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Presets */}
              <div className="visionos-panel p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-bold">
                  Surface Preset
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['silk', 'ocean', 'pond', 'lines', 'terminal', 'mesh'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setShowcasePreset(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                        showcasePreset === p
                          ? 'bg-red-600 text-white font-semibold shadow-sm shadow-red-600/40 border border-red-400'
                          : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] border border-white/[0.05]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Tints */}
              <div className="visionos-panel p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-bold">
                  Mark Color Accent
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Silver Grey', hex: '#d4d4d8' },
                    { name: 'Nothing Red', hex: '#ff2a34' },
                    { name: 'Mid Grey', hex: '#71717a' },
                    { name: 'Deep Crimson', hex: '#dc2626' },
                  ].map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setShowcaseColor(c.hex)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border font-mono ${
                        showcaseColor === c.hex
                          ? 'border-red-500 text-white bg-red-500/10'
                          : 'border-white/[0.06] text-zinc-400 hover:text-white bg-white/[0.03]'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edge Vignette */}
              <div className="visionos-panel p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-bold">
                  Fade Vignette
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['edges', 'center', 'bottom', 'top', 'none'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setShowcaseFade(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                        showcaseFade === f
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] border border-white/[0.05]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Exactly 600px height container as specified by React Bits */}
            <div
              className="rounded-2xl overflow-hidden border border-white/[0.14] shadow-2xl relative bg-black"
              style={{ width: '100%', height: '600px', position: 'relative' }}
            >
              <PatternWaves
                preset={showcasePreset}
                color={showcaseColor}
                accentColor="#ff2a34"
                backgroundColor={showcaseBg}
                fade={showcaseFade}
                fadeSize={0.5}
                interactive={showcaseInteractive}
                cursorSize={showcaseCursorSize}
                cursorStrength={showcaseCursorStrength}
                paused={showcasePaused}
              />

              {/* Overlay HUD indicators */}
              <div className="absolute top-4 left-4 pointer-events-none z-10 flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-red-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono text-red-400 font-semibold">
                  SURFACE: {showcasePreset.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  • Click anywhere for red impulse burst
                </span>
              </div>

              <div className="absolute bottom-4 right-4 pointer-events-none z-10 bg-black/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>React Bits &lt;PatternWaves /&gt; • Black, Grey, Red & White</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE CARDS (NOTHING OS 2.0 INDUSTRIAL CARDS) ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/60 border border-white/10 px-3.5 py-1 text-xs font-mono text-zinc-400 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>// 02 SPECIALIZED TELEMETRY MODULES</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-nothing">
            Engineered Diagnostics Suite
          </h2>
          <p className="mt-2 text-xs font-mono text-zinc-400">
            Automotive telemetry algorithms calibrated for real-world driving environments.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            index="SYS.01"
            icon={<GitCompare className="h-5 w-5" />}
            title="Scenario & Route Comparison"
            description="Compare driving during morning peak vs off-peak hours, or cruising at 75 vs 105 km/h to see direct cost differences."
            href="/compare"
          />
          <FeatureCard
            index="DIAG.02"
            icon={<TrendingDown className="h-5 w-5" />}
            title="Physical Loss Diagnostics"
            description="Isolate aerodynamic drag penalties, idling losses, and weight penalties to pinpoint how to save 15-25% on fuel."
            href="/calibration"
          />
          <FeatureCard
            index="AUDIT.03"
            icon={<Shield className="h-5 w-5" />}
            title="Validation & Accuracy Audit"
            description="Inspect real regression metrics (R², Mean Absolute Error, test holdouts) with zero simulated or fake numbers."
            href="/validation"
          />
        </div>
      </section>
    </div>
  );
}

/* ─── Reusable visionOS Sub-Components ─── */

function SliderCard({
  label,
  value,
  color,
  hint,
  children,
}: {
  label: string;
  value: string;
  color: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="visionos-panel p-4 flex flex-col justify-between bg-dot-matrix-fine hover:border-white/20 transition-all">
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-medium text-zinc-300 font-mono">{label}</span>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-black/70 border border-white/10 text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {value}
          </span>
        </div>
        {children}
      </div>
      {hint && <span className="text-[10px] font-mono text-zinc-500 mt-2 block">{hint}</span>}
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-zinc-400">{label}</span>
      <span className={`font-mono font-medium ${color}`}>{value}</span>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: string;
}) {
  return (
    <div className="visionos-panel p-6 flex flex-col justify-between bg-dot-matrix-fine relative group hover:border-white/20 transition-all">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white shadow-inner group-hover:scale-105 transition-transform">
            {icon}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <DotMatrixText text={step} size="xs" activeColor="#ffffff" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-white mb-2 font-nothing">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed font-mono">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  index,
  icon,
  title,
  description,
  href,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="visionos-panel block p-6 group hover:border-red-500/40 transition-all bg-dot-matrix-fine relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/25 text-red-500 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase bg-black/70 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 group-hover:bg-red-500 transition-colors" />
          {index}
        </span>
      </div>
      <h3 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors mb-2 font-nothing">
        {title}
      </h3>
      <p className="text-xs text-zinc-400 leading-relaxed mb-4 font-mono">{description}</p>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 group-hover:gap-2.5 transition-all font-mono">
        Open Module <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
