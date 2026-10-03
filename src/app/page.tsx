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
import { NothingWidgetDeck } from '@/components/widgets/NothingWidgetDeck';
import { NothingFuelGauge, NothingAnalogClock } from '@/components/widgets/NothingWidgets';
import { DotMatrixText } from '@/components/widgets/DotMatrixDisplay';
import { NothingPhoneMockup } from '@/components/widgets/NothingPhoneMockup';
import PatternWaves from '@/components/PatternWaves/PatternWaves';

export default function LandingPage() {
  // PatternWaves Presets and Showcase State
  const [heroWavePreset, setHeroWavePreset] = useState<'silk' | 'ocean' | 'pond' | 'lines' | 'terminal' | 'mesh'>('silk');
  const [showcasePreset, setShowcasePreset] = useState<'silk' | 'ocean' | 'pond' | 'lines' | 'terminal' | 'mesh'>('silk');
  const [showcaseColor, setShowcaseColor] = useState('#34d399');
  const [showcaseBg, setShowcaseBg] = useState('#000000');
  const [showcaseFade, setShowcaseFade] = useState<'edges' | 'center' | 'bottom' | 'top' | 'none'>('edges');
  const [showcaseInteractive, setShowcaseInteractive] = useState(true);
  const [showcaseCursorStrength, setShowcaseCursorStrength] = useState(0.6);
  const [showcaseCursorSize, setShowcaseCursorSize] = useState(50);
  const [showcasePaused, setShowcasePaused] = useState(false);

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
      {/* ═══════════ HERO SECTION WITH PATTERNWAVES BACKGROUND ═══════════ */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 min-h-[580px]">
        {/* PatternWaves interactive WebGL background from React Bits */}
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-75">
          <PatternWaves
            preset={heroWavePreset}
            color="#34d399"
            backgroundColor="transparent"
            fade="edges"
            fadeSize={0.65}
            interactive={true}
            cursorSize={60}
            cursorStrength={0.55}
            speed={0.28}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center pointer-events-none">
          <div className="animate-fade-in-up pointer-events-auto">
            {/* visionOS Spatial pill tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] border border-white/[0.18] backdrop-blur-xl px-4 py-1.5 text-xs font-medium text-emerald-300 mb-8 shadow-lg shadow-black/20"
                 style={{ boxShadow: 'inset 0 1px 0.5px rgba(255, 255, 255, 0.35)' }}>
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>visionOS 2 Spatial Telemetry & Physical OLS Calibration</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.08]">
              Know your real
              <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                fuel costs
              </span>
              {' '}before
              <br />
              you drive.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300/90 sm:text-lg leading-relaxed font-normal">
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
                <Fuel className="h-4 w-4 text-emerald-400" />
                <span>Log Driving Telemetry</span>
              </Link>
            </div>

            {/* Fluid Wave Preset Selector Chips */}
            <div className="mt-8 inline-flex items-center gap-1.5 p-1 rounded-full bg-black/50 border border-white/10 backdrop-blur-xl text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2.5 flex items-center gap-1.5">
                <Waves className="h-3 w-3 text-emerald-400" />
                Surface Wave:
              </span>
              {(['silk', 'ocean', 'pond', 'lines', 'terminal', 'mesh'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setHeroWavePreset(p)}
                  className={`px-2.5 py-1 rounded-full transition-all capitalize font-mono text-[11px] ${
                    heroWavePreset === p
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {p}
                </button>
              ))}
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
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
                  Interactive Physics Simulator
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time quadratic aerodynamic drag ($V^2$), payload load ratio, grade gradient, and traffic friction.
              </p>
            </div>

            {/* Quick Presets Ornament */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md">
              <span className="text-[10px] uppercase font-semibold text-slate-400 px-2.5">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('city')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                City Grid
              </button>
              <button
                type="button"
                onClick={() => applyPreset('highway')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                Expressway
              </button>
              <button
                type="button"
                onClick={() => applyPreset('mountain')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                Ghats/Mountain
              </button>
              <button
                type="button"
                onClick={() => applyPreset('commute')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                Mixed Commute
              </button>
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
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
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
                  onChange={(e) => setBaseMileageKmPerL(Number(e.target.value))}
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
                  onChange={(e) => setAvgSpeedKmh(Number(e.target.value))}
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
                  onChange={(e) => setTrafficIntensity(Number(e.target.value))}
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
                  onChange={(e) => setLoadRatio(Number(e.target.value))}
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
                  onChange={(e) => setGradientPercent(Number(e.target.value))}
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
                  onChange={(e) => setIdleMinutes(Number(e.target.value))}
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
                  onChange={(e) => setFuelPricePerLitre(Number(e.target.value))}
                  className="w-full"
                />
              </SliderCard>
            </div>

            {/* Results Window Panel with visionOS Gauges */}
            <div className="lg:col-span-5 flex flex-col justify-between visionos-panel p-6">
              {calculation.valid && calculation.pred && calculation.cost ? (
                <>
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-emerald-400" />
                        Predicted Telemetry
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        OLS Baseline Model
                      </span>
                    </div>

                    {/* Circular visionOS Gauges */}
                    <div className="mt-4 grid grid-cols-2 gap-2 bg-white/[0.02] p-2 rounded-2xl border border-white/[0.05]">
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

                    {/* Cost Metrics */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                        <span className="text-[11px] text-slate-400 block font-medium">Estimated Cost</span>
                        <span className="text-2xl font-bold font-mono text-emerald-400 glow-green mt-1 block">
                          ₹{calculation.cost.totalCost.toFixed(0)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                        <span className="text-[11px] text-slate-400 block font-medium">Cost per km</span>
                        <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
                          ₹{calculation.cost.costPerKm.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Physics Breakdown */}
                    <div className="mt-5 pt-4 border-t border-white/[0.08]">
                      <span className="text-xs font-semibold text-slate-300 mb-2.5 block">
                        Physical Consumption Breakdown
                      </span>
                      <div className="space-y-1.5 text-xs">
                        <BreakdownRow label="Base Highway Cruising" value={`${calculation.pred.baseFuelLiters.toFixed(2)} L`} color="text-slate-300" />
                        <BreakdownRow label="Aerodynamic Drag (V²)" value={`+${calculation.pred.speedTermLiters.toFixed(2)} L`} color="text-emerald-400" />
                        <BreakdownRow label="Traffic Congestion" value={`+${calculation.pred.trafficTermLiters.toFixed(2)} L`} color="text-amber-400" />
                        <BreakdownRow label="Payload & Passenger Weight" value={`+${calculation.pred.loadTermLiters.toFixed(2)} L`} color="text-cyan-400" />
                        <BreakdownRow label="Elevation Grade" value={`${calculation.pred.gradientTermLiters >= 0 ? '+' : ''}${calculation.pred.gradientTermLiters.toFixed(2)} L`} color="text-purple-400" />
                        <BreakdownRow label="Engine Idling Runtime" value={`+${calculation.pred.idleTermLiters.toFixed(2)} L`} color="text-rose-400" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.08]">
                    <Link
                      href="/plan"
                      className="w-full visionos-pill-btn-primary py-3 text-center justify-center text-xs"
                    >
                      <span>Plan Route with Live Elevation</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="py-8 text-sm text-rose-400 text-center">Adjust inputs to calculate</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* ═══════════ NOTHING OS 2.0 & NOTHING PHONE (2) COCKPIT ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 w-full mb-28">
        <div className="visionos-window overflow-hidden">
          <MacOSWindowChrome
            title="Nothing OS 2.0 & Nothing Phone (2) Hardware Cockpit"
            subtitle="Industrial Dot-Matrix Hybrid Gauges & Glyph Interface"
          />
          <div className="p-6 sm:p-10 bg-dot-matrix-fine">
            <div className="visionos-grab-bar" />
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
              {/* Left 8 Cols: Nothing Widgets Suite */}
              <div className="xl:col-span-8">
                <NothingWidgetDeck
                  onPresetSelect={applyPreset}
                  currentSpeed={avgSpeedKmh}
                  currentEfficiency={calculation.pred?.effectiveMileageKmPerL || baseMileageKmPerL}
                  fuelRate={calculation.pred ? (100 / calculation.pred.effectiveMileageKmPerL) : 6.06}
                  costPerKm={calculation.cost?.costPerKm || 6.21}
                  dragLevel={Math.min(1, Math.pow(avgSpeedKmh / 120, 2))}
                  gradientLevel={Math.min(1, Math.max(0, (gradientPercent + 4) / 10))}
                  trafficLevel={trafficIntensity}
                  loadLevel={loadRatio}
                />
              </div>

              {/* Right 4 Cols: Nothing Phone (2) Mockup with Glyph Interface */}
              <div className="xl:col-span-4 flex flex-col items-center justify-center pt-2">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">
                    NOTHING PHONE (2)
                  </span>
                  <h4 className="text-sm font-bold text-white font-nothing">
                    Interactive Glyph Cockpit
                  </h4>
                </div>
                <NothingPhoneMockup
                  speed={avgSpeedKmh}
                  efficiency={calculation.pred?.effectiveMileageKmPerL || baseMileageKmPerL}
                  fuelLiters={calculation.pred?.totalFuelLiters || 4.2}
                  cost={calculation.cost?.totalCost || 430}
                  vehicleName="Tata Nexon 1.5 Diesel"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS (visionOS SPATIAL CARDS) ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Four Steps to Mathematical Precision
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Moving beyond inaccurate window-sticker ratings with your personal driving calibration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StepCard
            step="01"
            icon={<Car className="h-5 w-5 text-emerald-400" />}
            title="Register Vehicle"
            description="Add your vehicle specification, rated baseline mileage M₀, and fuel grade."
            accent="emerald"
          />
          <StepCard
            step="02"
            icon={<MapPin className="h-5 w-5 text-cyan-400" />}
            title="Log Journey Trips"
            description="Log trips with real GPS distance, average speed, traffic levels, and actual fuel pumped."
            accent="cyan"
          />
          <StepCard
            step="03"
            icon={<BarChart3 className="h-5 w-5 text-purple-400" />}
            title="OLS Calibration"
            description="At 8+ logged trips, our matrix engine solves regression coefficients specific to your driving style."
            accent="purple"
          />
          <StepCard
            step="04"
            icon={<Zap className="h-5 w-5 text-amber-400" />}
            title="Spatial Predictions"
            description="Preview exact fuel quantities and rupee expenses for any route before starting the engine."
            accent="amber"
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
                  <Waves className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
                    &lt;PatternWaves /&gt; Fluid Surface
                  </h2>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    React Bits
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Interactive fluid dynamics shader modeling aerodynamic boundary layer turbulence. Move or click your cursor across the surface to cast interactive wakes, ripples, and specular glints.
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowcasePaused(!showcasePaused)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    showcasePaused
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : 'bg-white/[0.05] text-slate-300 border-white/[0.1] hover:bg-white/[0.1]'
                  }`}
                >
                  {showcasePaused ? '▶ Resume Surface' : '⏸ Pause Surface'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowcaseInteractive(!showcaseInteractive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    showcaseInteractive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-white/[0.05] text-slate-400 border-white/[0.1]'
                  }`}
                >
                  {showcaseInteractive ? 'Cursor Ripples: Active' : 'Cursor Ripples: Off'}
                </button>
              </div>
            </div>

            {/* Presets and Attributes Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Presets */}
              <div className="visionos-panel p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-bold">
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
                          ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/25'
                          : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/[0.05]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Tints */}
              <div className="visionos-panel p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-bold">
                  Color Accent
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Fuel Emerald', hex: '#34d399' },
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Aero Cyan', hex: '#38bdf8' },
                    { name: 'Exhaust Amber', hex: '#fbbf24' },
                    { name: 'Nothing Red', hex: '#ef4444' },
                  ].map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setShowcaseColor(c.hex)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                        showcaseColor === c.hex
                          ? 'border-white text-white bg-white/[0.1]'
                          : 'border-white/[0.06] text-slate-400 hover:text-white bg-white/[0.03]'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edge Vignette */}
              <div className="visionos-panel p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-bold">
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
                          ? 'bg-white text-slate-950 font-semibold'
                          : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/[0.05]'
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
              className="rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl relative bg-black"
              style={{ width: '100%', height: '600px', position: 'relative' }}
            >
              <PatternWaves
                preset={showcasePreset}
                color={showcaseColor}
                backgroundColor={showcaseBg}
                fade={showcaseFade}
                fadeSize={0.5}
                interactive={showcaseInteractive}
                cursorSize={showcaseCursorSize}
                cursorStrength={showcaseCursorStrength}
                paused={showcasePaused}
              />

              {/* Overlay HUD indicators */}
              <div className="absolute top-4 left-4 pointer-events-none z-10 flex items-center gap-2 bg-black/70 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-full shadow-lg">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono text-emerald-300 font-semibold">
                  SURFACE: {showcasePreset.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  • Move cursor to ripple • Click for impulse splash
                </span>
              </div>

              <div className="absolute bottom-4 right-4 pointer-events-none z-10 bg-black/70 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>React Bits &lt;PatternWaves /&gt; • ogl WebGL2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE CARDS ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<GitCompare className="h-5 w-5" />}
            title="Scenario & Route Comparison"
            description="Compare driving during morning peak vs off-peak hours, or cruising at 75 vs 105 km/h to see direct cost differences."
            href="/compare"
          />
          <FeatureCard
            icon={<TrendingDown className="h-5 w-5" />}
            title="Physical Loss Diagnostics"
            description="Isolate aerodynamic drag penalties, idling losses, and weight penalties to pinpoint how to save 15-25% on fuel."
            href="/calibration"
          />
          <FeatureCard
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
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    rose: 'text-rose-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className="visionos-panel p-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-medium text-slate-300">{label}</span>
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] ${colorMap[color] || 'text-white'}`}>
            {value}
          </span>
        </div>
        {children}
      </div>
      {hint && <span className="text-[10px] text-slate-500 mt-2 block">{hint}</span>}
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
      <span className="text-slate-400">{label}</span>
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
  accent: string;
}) {
  return (
    <div className="visionos-panel p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/[0.14] shadow-inner">
            {icon}
          </div>
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
            {step}
          </span>
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="visionos-panel block p-6 group">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/12 border border-emerald-400/25 text-emerald-400 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">{description}</p>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:gap-2.5 transition-all">
        Open Feature <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
