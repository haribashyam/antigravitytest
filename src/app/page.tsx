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
  Target,
  Terminal,
  Activity,
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
import { AntigravityTextReveal } from '@/components/effects/AntigravityTextReveal';
import { AntigravityDepthParallax } from '@/components/effects/AntigravityDepthParallax';
import { AntigravityFeatureArc } from '@/components/effects/AntigravityFeatureArc';
import { AntigravityTiltCard } from '@/components/effects/useMouseTilt';

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
    <AntigravityDepthParallax>
      <div className="flex flex-col">
        {/* ═══════════ HERO SECTION (AESTHETIC CENTERPIECE OVER PATTERNWAVES) ═══════════ */}
        <section
          data-hero-pin-section
          className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28"
        >
          {/* Soft Ambient Radial Aura matching the WebGL fluid wave surface */}
          <div
            data-parallax-layer="1"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.14)_0%,rgba(255,255,255,0.03)_35%,transparent_70%)] blur-3xl pointer-events-none -z-10"
          />

          <div
            data-hero-text
            className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center"
          >
            <div className="animate-fade-in-up">
              {/* Aesthetic Telemetry HUD Pill */}
              <div className="inline-flex items-center gap-2.5 rounded-full bg-zinc-100 dark:bg-black/60 border border-zinc-300 dark:border-white/20 backdrop-blur-2xl px-4 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 mb-8 shadow-md dark:shadow-2xl shadow-red-950/20 group cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ff2a34]" />
                </span>
                <span className="tracking-wider uppercase font-bold text-zinc-900 dark:text-zinc-200">
                  LIVE FLUID TELEMETRY
                </span>
                <span className="text-zinc-400 dark:text-zinc-600 font-bold">•</span>
                <span className="text-red-600 dark:text-red-400 font-bold tracking-widest text-[10.5px]">
                  60 FPS WEBGL2 WAKE
                </span>
              </div>

              {/* Architectural Cinematic Headline (Google Antigravity Typewriter Reveal) */}
              <AntigravityTextReveal />

              {/* Aesthetic Frosted Glassmorphism Value Card */}
              <div className="mx-auto mt-8 max-w-2xl px-7 py-5 rounded-3xl bg-white/90 dark:bg-black/50 border border-zinc-200 dark:border-white/10 backdrop-blur-2xl shadow-md dark:shadow-2xl relative overflow-hidden bg-dot-matrix-fine group hover:border-red-500/30 dark:hover:border-white/20 transition-all">
                {/* Top specular accent line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold">
                  Automotive-grade journey fuel predictions calibrated directly against your vehicle&apos;s physical telemetry.
                  Zero guesswork — governed by quadratic aerodynamic drag ($V^2$), topography incline, and OLS regression.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/plan"
                  className="visionos-pill-btn-primary py-3.5 px-7 text-sm font-bold tracking-wide shadow-xl shadow-red-600/25"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Plan a Spatial Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/trips/new"
                  className="visionos-pill-btn py-3.5 px-6 text-sm font-bold tracking-wide text-zinc-900 dark:text-white"
                >
                  <Fuel className="h-4 w-4 text-red-500" />
                  <span>Log Driving Telemetry</span>
                </Link>
              </div>

              {/* Central Interactive Telemetry Deck */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-black/60 border border-zinc-300 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-zinc-300 backdrop-blur-md shadow-sm dark:shadow-lg dark:shadow-black/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">PHYSICS:</span>
                  <span className="font-extrabold text-zinc-950 dark:text-white">QUADRATIC V² DRAG</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-black/60 border border-zinc-300 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-zinc-300 backdrop-blur-md shadow-sm dark:shadow-lg dark:shadow-black/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 dark:bg-white" />
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">REGRESSION:</span>
                  <span className="font-extrabold text-zinc-950 dark:text-white">OLS CALIBRATED</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-black/60 border border-zinc-300 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-zinc-300 backdrop-blur-md shadow-sm dark:shadow-lg dark:shadow-black/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">PRECISION:</span>
                  <span className="font-extrabold text-zinc-950 dark:text-white">±0.2 LITRE MAE</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-black/60 border border-zinc-300 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-zinc-300 backdrop-blur-md shadow-sm dark:shadow-lg dark:shadow-black/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">SURFACE:</span>
                  <span className="font-extrabold text-zinc-950 dark:text-white">CLICK TO SHOCKWAVE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ LIVE visionOS SPATIAL CALCULATOR WINDOW (Image 3 Spatial Zoom) ═══════════ */}
        <section
          data-cockpit-window
          className="mx-auto max-w-6xl px-4 sm:px-6 w-full -mt-8 mb-24"
        >
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight font-nothing">
                      Interactive Physics Simulator
                    </h2>
                    <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-black/60 border border-zinc-300 dark:border-white/10 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      NOTHING 2.0 HYBRID COCKPIT
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-semibold mt-0.5">
                    Real-time quadratic aerodynamic drag ($V^2$), payload load ratio, grade gradient, and traffic friction.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Presets Ornament with Nothing OS Tactile Pills */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl sm:rounded-full bg-zinc-200/80 dark:bg-black/80 border border-zinc-300/90 dark:border-white/15 backdrop-blur-md shadow-sm">
              <span className="text-[11px] uppercase font-mono tracking-wider text-zinc-950 dark:text-white px-2.5 flex items-center gap-1.5 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
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
                    className={`px-3 py-1.5 text-xs font-mono rounded-full transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/40 border border-red-500 font-extrabold'
                        : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300/80 dark:border-white/15 shadow-xs'
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
                      <div className="p-3.5 rounded-2xl bg-zinc-100/90 dark:bg-black/70 border border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-bold">Real Mileage</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        </div>
                        <div className="flex items-baseline gap-1.5 my-1">
                          <DotMatrixText
                            text={calculation.pred.effectiveMileageKmPerL.toFixed(1)}
                            size="sm"
                          />
                          <span className="text-xs font-mono font-extrabold text-red-600 dark:text-red-400">km/L</span>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 block">
                          rated: {baseMileageKmPerL} km/L
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-zinc-100/90 dark:bg-black/70 border border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-bold">Estimated Cost</span>
                          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">₹{calculation.cost.costPerKm.toFixed(2)}/km</span>
                        </div>
                        <div className="flex items-baseline gap-1 my-1">
                          <span className="text-base font-extrabold font-mono text-zinc-950 dark:text-white">₹</span>
                          <DotMatrixText
                            text={calculation.cost.totalCost.toFixed(0)}
                            size="sm"
                            activeColor="#ff2a34"
                          />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 block">
                          {calculation.pred.totalFuelLiters.toFixed(1)} L fuel pumped
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Nothing Dot-Matrix Power Demand Grid (Equalizer) */}
                    <div className="mt-4">
                      <NothingEqualizer
                        className="bg-zinc-100/90 dark:bg-black/70 border-zinc-200 dark:border-white/10 shadow-sm"
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
                    <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/[0.08]">
                      <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 mb-2 block tracking-wider uppercase">
                        // Friction Loss Breakdown
                      </span>
                      <div className="space-y-1.5 text-xs font-mono">
                        <BreakdownRow label="Base Highway Cruising" value={`${calculation.pred.baseFuelLiters.toFixed(2)} L`} color="text-zinc-800 dark:text-zinc-200" />
                        <BreakdownRow label="Aerodynamic Drag (V²)" value={`+${calculation.pred.speedTermLiters.toFixed(2)} L`} color="text-red-600 dark:text-red-400" />
                        <BreakdownRow label="Traffic Congestion" value={`+${calculation.pred.trafficTermLiters.toFixed(2)} L`} color="text-amber-600 dark:text-amber-400" />
                        <BreakdownRow label="Payload & Passenger Weight" value={`+${calculation.pred.loadTermLiters.toFixed(2)} L`} color="text-zinc-800 dark:text-zinc-200" />
                        <BreakdownRow label="Elevation Grade" value={`${calculation.pred.gradientTermLiters >= 0 ? '+' : ''}${calculation.pred.gradientTermLiters.toFixed(2)} L`} color="text-purple-600 dark:text-purple-400" />
                        <BreakdownRow label="Engine Idling Runtime" value={`+${calculation.pred.idleTermLiters.toFixed(2)} L`} color="text-rose-600 dark:text-rose-400" />
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

      {/* ═══════════ GOOGLE ANTIGRAVITY FLOATING TOOL ARC & TYPEWRITER PROMPT (Image 4) ═══════════ */}
      <AntigravityFeatureArc />

      {/* ═══════════ SCIENTIFIC BLUEPRINT & PURPOSE SPECIFICATION (AESTHETIC NOTE) ═══════════ */}
      <section data-3d-section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="visionos-window overflow-hidden relative">
          {/* macOS 27 Desktop Chrome Header */}
          <MacOSWindowChrome
            title="System Manifesto • Physics Kernel & Core Purpose"
            subtitle="Mathematical Specification • Classical Aerodynamics & Closed-Loop OLS"
          />

          <div className="p-6 sm:p-10 relative">
            <div className="visionos-grab-bar mb-6" />

            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-black/60 border border-zinc-300 dark:border-white/10 px-3.5 py-1 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>// ARCHITECTURAL BLUEPRINT</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-nothing">
                  What is FuelWise &amp; How Does It Work?
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-mono font-semibold max-w-2xl">
                  A high-precision journey fuel prediction engine calibrated directly to your vehicle&apos;s physical telemetry.
                </p>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="uppercase tracking-wider text-[11px]">CALIBRATED TELEMETRY KERNEL</span>
              </div>
            </div>

            {/* 3 Bento Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bento Card 1: Sole Purpose */}
              <AntigravityTiltCard className="h-full">
                <div className="visionos-panel p-6 sm:p-7 rounded-3xl flex flex-col justify-between relative overflow-hidden bg-dot-matrix-fine group bg-white/95 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400 font-extrabold">
                      01 • SOLE PURPOSE
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-600 dark:text-red-400">
                      <Target className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white font-nothing tracking-tight mb-3">
                    Eliminating Window-Sticker Fiction
                  </h3>
                  <p className="text-xs sm:text-[13px] text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                    Automakers certify fuel mileage using standardized dynamometer tests (ARAI / WLTP / EPA) under sterile indoor conditions with zero wind, flat laboratory tracks, and gentle acceleration.
                  </p>
                  <p className="text-xs sm:text-[13px] text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed mt-3">
                    In real life, highway speeds, ghat gradients, and city gridlock reduce actual fuel efficiency by <strong className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500/50 decoration-2">20% to 45%</strong>. FuelWise exists to replace this guesswork with <strong className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500/50 decoration-2">mathematical certainty</strong>, computing exact fuel litres and trip expenses before you turn the ignition.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  <span>ACCURACY TARGET</span>
                  <span className="font-extrabold text-red-600 dark:text-red-400">±0.2 LITRES MAE</span>
                </div>
                </div>
              </AntigravityTiltCard>

              {/* Bento Card 2: The Physical Equation */}
              <AntigravityTiltCard className="lg:col-span-2 h-full">
                <div className="visionos-panel p-6 sm:p-7 rounded-3xl flex flex-col justify-between relative overflow-hidden bg-dot-matrix-fine group bg-white/95 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all h-full">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-700 dark:text-zinc-300 font-extrabold">
                      02 • THE GOVERNING EQUATION
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-black/60 border border-zinc-300 dark:border-white/10 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      <Terminal className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                      <span>PHYSICS KERNEL</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white font-nothing tracking-tight mb-3">
                    Classical Dynamics &amp; Fluid Resistance Model
                  </h3>
                  <p className="text-xs sm:text-[13px] text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                    Rather than relying on generic averages, FuelWise predicts fuel consumption by calculating the work required to overcome five fundamental resistive physical forces:
                  </p>

                  {/* Formula Code Window (Translucent VisionOS Glass Terminal) */}
                  <div className="my-4 p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-black/45 backdrop-blur-xl border border-zinc-300/80 dark:border-white/15 shadow-sm overflow-x-auto transition-all">
                    <div className="flex items-center justify-between text-[11px] mb-2.5 pb-2 border-b border-zinc-300/70 dark:border-white/10 font-bold">
                      <span className="font-mono text-zinc-600 dark:text-zinc-400">// GENERALIZED RESISTANCE EQUATION</span>
                      <span className="font-mono text-red-600 dark:text-red-400 font-extrabold tracking-wider">UNIT: LITRES (L)</span>
                    </div>
                    <div className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-xs sm:text-sm whitespace-nowrap tracking-wide">
                      Fuel(L) = (Distance / M₀) × [ 1 + β_v·(V/100)² + β_t·Traffic + β_l·Load + β_g·Grade ] + β_i·t_idle
                    </div>
                    <div className="font-mono text-zinc-900 dark:text-zinc-200 font-bold text-xs mt-2 whitespace-nowrap">
                      Trip Cost (₹/$) = Predicted Fuel (L) × Local Fuel Price per Litre
                    </div>
                  </div>

                  {/* 4 Force Factors Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                    <div className="p-3.5 rounded-2xl bg-red-500/[0.06] dark:bg-white/[0.04] border border-red-500/20 dark:border-white/10 shadow-sm">
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-xs mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span>AERO DRAG (V²)</span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed font-mono">
                        Air resistance scales quadratically with speed (Fd = ½ · ρ · Cd · A · V²). Cruising at 110 km/h consumes ~35% more fuel than at 80 km/h.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-500/[0.06] dark:bg-white/[0.04] border border-purple-500/20 dark:border-white/10 shadow-sm">
                      <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>GRAVITY &amp; INCLINE (G)</span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed font-mono">
                        Climbing uphill demands gravitational work (W = m · g · Δh). A 4.5% mountain climb consumes over 2.4× more fuel per km than flat highway cruising.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-500/[0.06] dark:bg-white/[0.04] border border-amber-500/20 dark:border-white/10 shadow-sm">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>TRAFFIC &amp; INERTIA (T)</span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed font-mono">
                        Braking converts kinetic energy (Ek = ½ · m · V²) into wasted heat; re-accelerating in city jams burns excessive fuel.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-cyan-500/[0.06] dark:bg-white/[0.04] border border-cyan-500/20 dark:border-white/10 shadow-sm">
                      <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-xs mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span>IDLE COMBUSTION (t_idle)</span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed font-mono">
                        At traffic lights and stops, parasitic engine operation sustains AC compressor and electronics at 0.6–1.2 L/hr without moving distance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AntigravityTiltCard>
          </div>

            {/* Bottom OLS Calibration Note Banner (Translucent VisionOS Glass Panel) */}
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-white/70 dark:bg-black/45 border border-zinc-300/80 dark:border-white/15 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300 flex-shrink-0 mt-0.5 shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-zinc-950 dark:text-white font-nothing tracking-wide">
                      Closed-Loop Machine Learning (Ordinary Least Squares)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-[10.5px] font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
                      β̂ = (XᵀX)⁻¹XᵀY
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-medium text-zinc-800 dark:text-zinc-200 mt-1 max-w-3xl leading-relaxed">
                    Every car ages differently, tyre pressures vary, and every driver has a unique throttle curve. Once you log <strong className="font-extrabold text-zinc-950 dark:text-white underline decoration-emerald-500/60 decoration-2">8 trips</strong>, FuelWise solves your vehicle&apos;s personal regression matrix with L2 regularization damping, automatically calibrating all β coefficients to your exact driving profile.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                <Link
                  href="/calibration"
                  className="px-4 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white/15 dark:hover:bg-white/25 dark:text-white border border-zinc-900 dark:border-white/25 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Explore Calibration Engine</span>
                  <ChevronRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS (visionOS & NOTHING OS 2.0 HYBRID) ═══════════ */}
      <section data-3d-section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-black/60 border border-zinc-300 dark:border-white/10 px-3.5 py-1 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>// 01 WORKFLOW ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-nothing">
            Four Steps to Mathematical Precision
          </h2>
          <p className="mt-2.5 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-mono font-semibold">
            Moving beyond inaccurate window-sticker ratings with your personal driving calibration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StepCard
            step="01"
            icon={<Car className="h-5 w-5" />}
            title="Register Vehicle"
            description="Add your vehicle specification, rated baseline mileage M₀, and fuel grade."
          />
          <StepCard
            step="02"
            icon={<MapPin className="h-5 w-5" />}
            title="Log Journey Trips"
            description="Log trips with real GPS distance, average speed, traffic levels, and actual fuel pumped."
          />
          <StepCard
            step="03"
            icon={<BarChart3 className="h-5 w-5" />}
            title="OLS Calibration"
            description="At 8+ logged trips, our matrix engine solves regression coefficients specific to your driving style."
          />
          <StepCard
            step="04"
            icon={<Zap className="h-5 w-5" />}
            title="Spatial Predictions"
            description="Preview exact fuel quantities and rupee expenses for any route before starting the engine."
          />
        </div>
      </section>

      {/* ═══════════ REACT BITS PATTERNWAVES INTERACTIVE SHOWCASE ═══════════ */}
      <section data-3d-section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="visionos-window overflow-hidden">
          <MacOSWindowChrome
            title="React Bits • <PatternWaves /> WebGL Dynamics Surface"
            subtitle="OpenGL ES 3.00 WebGL2 Shaders • 60 FPS Fluid Cursor Wake • Mathematical Fluid Simulation"
          />

          <div className="p-6 sm:p-8">
            <div className="visionos-grab-bar" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-red-500" />
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight font-nothing">
                    &lt;PatternWaves /&gt; Fluid Surface
                  </h2>
                  <span className="text-[10px] font-mono uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 px-2.5 py-0.5 rounded-full font-bold">
                    Nothing OS • React Bits
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 mt-1 max-w-2xl font-mono font-semibold">
                  GLSL 3.00 ES fluid simulation in Black, Grey, Red &amp; White. Move or click anywhere to send shockwave ripples and fiery red specular glints across the dot matrix surface.
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowcasePaused(!showcasePaused)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 transition-all ${
                    showcasePaused
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40'
                      : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-white/[0.1] hover:bg-zinc-200 dark:hover:bg-white/[0.1]'
                  }`}
                >
                  {showcasePaused ? '▶ Resume Surface' : '⏸ Pause Surface'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowcaseInteractive(!showcaseInteractive)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border transition-all ${
                    showcaseInteractive
                      ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 shadow-sm shadow-red-500/20'
                      : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-white/[0.1]'
                  }`}
                >
                  {showcaseInteractive ? 'Cursor & Click Shockwave: ON' : 'Cursor Shockwave: OFF'}
                </button>
              </div>
            </div>

            {/* Presets and Attributes Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Presets */}
              <div className="visionos-panel p-3.5 bg-white/90 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block mb-2 font-bold">
                  Surface Preset
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['silk', 'ocean', 'pond', 'lines', 'terminal', 'mesh'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setShowcasePreset(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-all font-bold ${
                        showcasePreset === p
                          ? 'bg-red-600 text-white shadow-sm shadow-red-600/40 border border-red-400'
                          : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.1] border border-zinc-300 dark:border-white/[0.05]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Tints */}
              <div className="visionos-panel p-3.5 bg-white/90 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block mb-2 font-bold">
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
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border font-mono font-bold ${
                        showcaseColor === c.hex
                          ? 'border-red-500 text-red-600 dark:text-white bg-red-500/10'
                          : 'border-zinc-300 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-white/[0.03]'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edge Vignette */}
              <div className="visionos-panel p-3.5 bg-white/90 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block mb-2 font-bold">
                  Fade Vignette
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['edges', 'center', 'bottom', 'top', 'none'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setShowcaseFade(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-all font-bold ${
                        showcaseFade === f
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-extrabold shadow-sm'
                          : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.1] border border-zinc-300 dark:border-white/[0.05]'
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
              className="rounded-2xl overflow-hidden border border-zinc-300 dark:border-white/[0.14] shadow-2xl relative bg-black keep-white"
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
                <span className="text-xs font-mono text-red-400 font-bold">
                  SURFACE: {showcasePreset.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-zinc-300 font-semibold">
                  • Click anywhere for red impulse burst
                </span>
              </div>

              <div className="absolute bottom-4 right-4 pointer-events-none z-10 bg-black/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-300 flex items-center gap-2 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>React Bits &lt;PatternWaves /&gt; • Black, Grey, Red &amp; White</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE CARDS (NOTHING OS 2.0 INDUSTRIAL CARDS) ═══════════ */}
      <section data-3d-section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-black/60 border border-zinc-300 dark:border-white/10 px-3.5 py-1 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>// 02 SPECIALIZED TELEMETRY MODULES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-nothing">
            Engineered Diagnostics Suite
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">
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
    </AntigravityDepthParallax>
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
    <div className="visionos-panel p-4 flex flex-col justify-between bg-dot-matrix-fine bg-white/90 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-red-500/40 dark:hover:border-white/20 transition-all rounded-2xl shadow-sm">
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">{label}</span>
          <span className="text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-black/70 border border-zinc-300 dark:border-white/15 text-zinc-950 dark:text-white flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {value}
          </span>
        </div>
        {children}
      </div>
      {hint && <span className="text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 mt-2 block">{hint}</span>}
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
    <div className="flex justify-between items-center py-1">
      <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-xs">{label}</span>
      <span className={`font-mono font-bold text-xs ${color}`}>{value}</span>
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
    <AntigravityTiltCard className="h-full">
      <div className="visionos-panel p-6 flex flex-col justify-between bg-dot-matrix-fine relative group bg-white/95 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-red-500/30 dark:hover:border-white/20 transition-all rounded-3xl shadow-sm hover:shadow-md h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.12] text-zinc-900 dark:text-white shadow-inner group-hover:scale-105 transition-transform">
              {icon}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-black/70 border border-zinc-300 dark:border-white/10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white tracking-wider">{step}</span>
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-white mb-2 font-nothing">{title}</h3>
          <p className="text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed font-mono">{description}</p>
        </div>
      </div>
    </AntigravityTiltCard>
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
    <AntigravityTiltCard className="h-full">
      <Link href={href} className="visionos-panel block p-6 group hover:border-red-500/40 transition-all bg-dot-matrix-fine relative overflow-hidden bg-white/95 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-sm hover:shadow-md h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
            {icon}
          </div>
          <span className="text-[11px] font-mono tracking-widest text-zinc-800 dark:text-zinc-300 font-bold uppercase bg-zinc-100 dark:bg-black/70 border border-zinc-300 dark:border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 group-hover:bg-red-500 transition-colors" />
            {index}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-2 font-nothing">
          {title}
        </h3>
        <p className="text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed mb-4 font-mono">{description}</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 group-hover:gap-2.5 transition-all font-mono">
          Open Module <ChevronRight className="h-4 w-4" />
        </span>
      </Link>
    </AntigravityTiltCard>
  );
}
