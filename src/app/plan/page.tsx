'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Navigation,
  Car,
  Fuel,
  Sliders,
  MapPin,
  ShieldCheck,
  Search,
  Sparkles,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { DataSourceBadge, ModelStatusBadge } from '@/components/Badges';
import { SpatialGauge } from '@/components/visionOS/SpatialGauge';

interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year?: number;
  fuelType?: string;
  m0: number;
  tripCount: number;
  isCalibrated: boolean;
  activeCoefficients: any;
}

function TripPlannerContent() {
  const searchParams = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehicleId || '');
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Route Planning Inputs
  const [origin, setOrigin] = useState('Mumbai, Maharashtra');
  const [destination, setDestination] = useState('Pune, Maharashtra');
  const [distanceKm, setDistanceKm] = useState<number>(148.5);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState<number>(75);
  const [trafficLevel, setTrafficLevel] = useState<'free' | 'light' | 'moderate' | 'heavy'>('moderate');
  const [trafficIntensity, setTrafficIntensity] = useState<number>(0.45);
  const [loadRatio, setLoadRatio] = useState<number>(0.4);
  const [drivingStyle, setDrivingStyle] = useState<'eco' | 'normal' | 'aggressive'>('normal');
  const [aggressiveFactor, setAggressiveFactor] = useState<number>(0.4);
  const [gradientDecimal, setGradientDecimal] = useState<number>(0.012); // +1.2% incline
  const [idleMinutes, setIdleMinutes] = useState<number>(12);
  const [fuelPrice, setFuelPrice] = useState<number>(102.5);

  // Provenance metadata
  const [routeSource, setRouteSource] = useState('osrm_live');
  const [gradientSource, setGradientSource] = useState('open_elevation_api');
  const [priceSource, setPriceSource] = useState('live_feed');
  const [routingInProgress, setRoutingInProgress] = useState(false);

  // Prediction Response
  const [prediction, setPrediction] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState('');

  // Fetch Vehicles
  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        const vList = data.vehicles || [];
        setVehicles(vList);
        if (vList.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(vList[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingVehicles(false));
  }, [selectedVehicleId]);

  // Handle Route Search via OSRM & Open-Elevation
  const handleCalculateRoute = async () => {
    if (!origin || !destination) return;
    setRoutingInProgress(true);
    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      });
      const data = await res.json();
      if (res.ok && data.route && data.route.distanceKm > 0) {
        setDistanceKm(data.route.distanceKm);
        setAvgSpeedKmh(data.route.expectedSpeedKmh);
        setRouteSource(data.route.source);
        if (data.elevation) {
          setGradientDecimal(data.elevation.averageGradientDecimal);
          setGradientSource(data.elevation.source);
        }
      }
    } catch (err) {
      console.warn('Live routing failed, falling back to manual distance:', err);
    } finally {
      setRoutingInProgress(false);
    }
  };

  // Run prediction whenever parameters change
  useEffect(() => {
    if (!selectedVehicleId || !distanceKm || distanceKm <= 0) return;

    setCalculating(true);
    setCalcError('');

    fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId: selectedVehicleId,
        distanceKm,
        avgSpeedKmh,
        trafficIntensity,
        loadRatio,
        aggressiveFactor,
        gradientDecimal,
        idleMinutes,
        fuelPricePerLitre: fuelPrice,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setCalcError(data.error);
        } else {
          setPrediction(data);
          if (data.fuelPriceInfo) {
            setPriceSource(data.fuelPriceInfo.source);
          }
        }
      })
      .catch((err) => setCalcError(err.message))
      .finally(() => setCalculating(false));
  }, [
    selectedVehicleId,
    distanceKm,
    avgSpeedKmh,
    trafficIntensity,
    loadRatio,
    aggressiveFactor,
    gradientDecimal,
    idleMinutes,
    fuelPrice,
  ]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* visionOS Spatial Page Header */}
      <div className="visionos-window p-6 sm:p-8 mb-8">
        <div className="visionos-grab-bar" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 border border-emerald-400/25 px-3 py-0.5 text-[11px] font-semibold text-emerald-300">
                <Sparkles className="h-3 w-3" />
                visionOS Spatial Journey Predictor
              </span>
              {prediction?.modelStatus && (
                <span className="text-[11px] text-slate-400 font-mono">
                  [{prediction.modelStatus.label}]
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Trip Fuel & Cost Predictor
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Compute mathematically grounded fuel consumption for your journey using live routing, elevation telemetry, and regression coefficients.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Route and Driving Conditions Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vehicle Selector */}
          <div className="visionos-window p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="h-4 w-4 text-emerald-400" />
                Active Vehicle
              </label>
              <a href="/vehicles" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                Manage fleet →
              </a>
            </div>

            {loadingVehicles ? (
              <p className="text-xs text-slate-400">Loading vehicles...</p>
            ) : vehicles.length === 0 ? (
              <p className="text-xs text-amber-400">
                No vehicles configured.{' '}
                <a href="/vehicles" className="underline">
                  Please add a vehicle first.
                </a>
              </p>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full visionos-input cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#0b101d] text-white">
                    {v.name} ({v.year} {v.make} {v.model}) — M₀: {v.m0} km/L ({v.tripCount} trips)
                  </option>
                ))}
              </select>
            )}

            {selectedVehicle && (
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.08] pt-3">
                <span>Base Ideal Mileage: <strong className="text-white font-mono">{selectedVehicle.m0} km/L</strong></span>
                <ModelStatusBadge
                  isCalibrated={selectedVehicle.isCalibrated}
                  tripsCount={selectedVehicle.tripCount}
                />
              </div>
            )}
          </div>

          {/* Route Finder Card */}
          <div className="visionos-window p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-cyan-400" />
                Route Telemetry
              </span>
              <DataSourceBadge source={routeSource} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Origin City / Landmark</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="w-full visionos-input"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full visionos-input"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculateRoute}
              disabled={routingInProgress || !origin || !destination}
              className="visionos-pill-btn-primary w-full py-2.5 text-xs font-semibold"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{routingInProgress ? 'Fetching Live Route & Elevation...' : 'Fetch Live OSRM Distance & Grade'}</span>
            </button>
          </div>

          {/* Driving Dynamics Sliders */}
          <div className="visionos-window p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-purple-400" />
                Physical Driving Parameters
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Dynamic Inputs</span>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300">Road Distance (D)</span>
                <span className="font-mono text-emerald-400 font-bold bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full">
                  {distanceKm} km
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="800"
                step="2"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Speed Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300">Average Speed (V)</span>
                <span className="font-mono text-cyan-300 font-bold bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full">
                  {avgSpeedKmh} km/h
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="140"
                step="5"
                value={avgSpeedKmh}
                onChange={(e) => setAvgSpeedKmh(Number(e.target.value))}
                className="w-full slider-cyan"
              />
            </div>

            {/* Traffic Selector */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-300">Traffic Intensity (T)</span>
                <span className="font-mono text-amber-300 font-bold">
                  {(trafficIntensity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Free (10%)', val: 0.10 },
                  { label: 'Light (35%)', val: 0.35 },
                  { label: 'Moderate (65%)', val: 0.65 },
                  { label: 'Heavy (95%)', val: 0.95 },
                ].map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setTrafficIntensity(t.val)}
                    className={`rounded-full py-1.5 text-xs font-medium border transition-all ${
                      Math.abs(trafficIntensity - t.val) < 0.05
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                        : 'border-white/[0.1] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payload Load */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-300">Payload & Cargo Ratio (L)</span>
                <span className="font-mono text-blue-300 font-bold">
                  {(loadRatio * 100).toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Solo (10%)', val: 0.10 },
                  { label: '2 Ppl (30%)', val: 0.30 },
                  { label: 'Family (60%)', val: 0.60 },
                  { label: 'Full Cargo (90%)', val: 0.90 },
                ].map((l) => (
                  <button
                    key={l.label}
                    type="button"
                    onClick={() => setLoadRatio(l.val)}
                    className={`rounded-full py-1.5 text-xs font-medium border transition-all ${
                      Math.abs(loadRatio - l.val) < 0.05
                        ? 'border-blue-400 bg-blue-500/20 text-blue-300 font-semibold shadow-sm'
                        : 'border-white/[0.1] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Driving Style & Idling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.08]">
              <div>
                <label className="block text-xs text-slate-300 mb-2">
                  Driving Style (A = {aggressiveFactor} events/km)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Eco', val: 0.15 },
                    { label: 'Normal', val: 0.45 },
                    { label: 'Sport', val: 0.95 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setAggressiveFactor(s.val)}
                      className={`rounded-full py-1.5 text-xs border font-medium transition-all ${
                        Math.abs(aggressiveFactor - s.val) < 0.05
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                          : 'border-white/[0.1] bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Expected Idling Time</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={idleMinutes}
                    onChange={(e) => setIdleMinutes(Number(e.target.value))}
                    className="w-full visionos-input font-mono text-rose-300"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">mins</span>
                </div>
              </div>
            </div>

            {/* Fuel Price */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block mb-1">Fuel Price</span>
                <DataSourceBadge source={priceSource} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  step="0.1"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  className="w-24 visionos-input font-mono text-amber-300 text-right"
                />
                <span className="text-xs text-slate-400">/ Litre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Prediction Output & Decomposition Window (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 visionos-window p-6">
            <div className="visionos-grab-bar" />
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-emerald-400" />
                Predicted Journey Output
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                Formula Output
              </span>
            </div>

            {calculating ? (
              <div className="py-16 text-center text-xs text-slate-400 font-mono">
                Calculating physics engine output...
              </div>
            ) : calcError ? (
              <div className="my-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                {calcError}
              </div>
            ) : prediction && prediction.breakdown ? (
              <>
                {/* Circular Telemetry Gauges */}
                <div className="grid grid-cols-2 gap-2 visionos-panel p-2 mb-4">
                  <SpatialGauge
                    value={prediction.breakdown.totalFuelLiters}
                    min={1}
                    max={Math.max(50, prediction.breakdown.totalFuelLiters * 1.3)}
                    unit="Litres"
                    label="Total Fuel"
                    sublabel="Required"
                    color="emerald"
                    size={110}
                  />
                  <SpatialGauge
                    value={prediction.breakdown.effectiveMileageKmPerL}
                    min={5}
                    max={30}
                    unit="km / L"
                    label="Effective Mileage"
                    sublabel={`vs ${prediction.vehicle.m0} base`}
                    color="cyan"
                    size={110}
                  />
                </div>

                {/* Big Metric Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="visionos-panel p-3.5">
                    <span className="text-[11px] text-slate-400 block font-medium">Estimated Cost</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 glow-green mt-1 block">
                      ₹{prediction.breakdown.totalCost.toFixed(0)}
                    </span>
                  </div>

                  <div className="visionos-panel p-3.5">
                    <span className="text-[11px] text-slate-400 block font-medium">Cost Per km</span>
                    <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
                      ₹{prediction.breakdown.costPerKm.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Factor Contribution Breakdown Waterfall */}
                <div className="mt-5 border-t border-white/[0.08] pt-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-slate-300">
                      Physical Resistance Breakdown
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (Litres)
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center py-0.5 text-slate-300">
                      <span>Base Fuel Consumption (D / M₀)</span>
                      <span className="font-mono font-bold text-white">
                        {prediction.breakdown.baseFuelLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 text-emerald-400">
                      <span>+ Speed Drag Resistance (kv·V²)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.speedTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 text-amber-400">
                      <span>+ Traffic Delays & Stop-and-Go (kt·T)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.trafficTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 text-cyan-400">
                      <span>+ Vehicle Payload Resistance (kl·L)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.loadTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 text-rose-400">
                      <span>+ Aggressive Acceleration (ka·A)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.aggressiveTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 text-purple-400">
                      <span>+ Road Gradient Elevation (kg·G)</span>
                      <span className="font-mono font-bold">
                        {prediction.breakdown.gradientTermLiters >= 0 ? '+' : ''}
                        {prediction.breakdown.gradientTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 text-rose-400">
                      <span>+ Engine Idling Runtime (ki·t_idle)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.idleTermLiters.toFixed(2)} L
                      </span>
                    </div>
                  </div>
                </div>

                {/* Model Attribution Badge */}
                <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Calculation Provenance</span>
                  </div>
                  <p className="mt-1 leading-relaxed">
                    {prediction.modelStatus.label}. Base mileage {prediction.vehicle.m0} km/L.
                    Formula: F = (D/M₀)·(1 + kvV² + ktT + klL + kaA + kgG) + ki·t_idle.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripPlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-400 font-mono text-sm">
          Loading spatial trip predictor...
        </div>
      }
    >
      <TripPlannerContent />
    </Suspense>
  );
}
