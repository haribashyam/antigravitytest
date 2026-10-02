'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Navigation,
  Car,
  DollarSign,
  Fuel,
  Gauge,
  Sliders,
  MapPin,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import { DataSourceBadge, ModelStatusBadge } from '@/components/Badges';

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
      {/* Title */}
      <div className="border-b border-[#1f2e45] pb-6">
        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
            PRECISION PREDICTOR
          </span>
          {prediction?.modelStatus && (
            <span className="text-xs text-gray-400 font-mono">
              [{prediction.modelStatus.label}]
            </span>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
          Trip Fuel & Cost Predictor
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Compute mathematically grounded fuel consumption for your planned journey using live routing, elevation, and personal vehicle coefficients.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Route and Driving Conditions Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vehicle Selector */}
          <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Vehicle
              </label>
              <a href="/vehicles" className="text-xs text-emerald-400 hover:underline">
                Manage fleet →
              </a>
            </div>

            {loadingVehicles ? (
              <p className="text-xs text-gray-400">Loading vehicles...</p>
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
                className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.year} {v.make} {v.model}) — M₀: {v.m0} km/L ({v.tripCount} trips)
                  </option>
                ))}
              </select>
            )}

            {selectedVehicle && (
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-[#1f2e45] pt-2.5">
                <span>Base Ideal Mileage: <strong className="text-white">{selectedVehicle.m0} km/L</strong></span>
                <ModelStatusBadge
                  isCalibrated={selectedVehicle.isCalibrated}
                  tripsCount={selectedVehicle.tripCount}
                />
              </div>
            )}
          </div>

          {/* Route Finder Card */}
          <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Planned Route
              </span>
              <DataSourceBadge source={routeSource} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Origin City / Landmark</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculateRoute}
              disabled={routingInProgress}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <Search className="h-3.5 w-3.5" />
              {routingInProgress ? 'Calculating OSRM Route & Elevation...' : 'Query Live Driving Route & Gradient'}
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#1f2e45] pt-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Route Distance (km)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Expected Avg Speed</label>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="140"
                  value={avgSpeedKmh}
                  onChange={(e) => setAvgSpeedKmh(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-1.5 text-xs font-mono font-bold text-cyan-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Road Incline (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={Number((gradientDecimal * 100).toFixed(1))}
                  onChange={(e) => setGradientDecimal(Number(e.target.value) / 100)}
                  className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-1.5 text-xs font-mono font-bold text-purple-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Driving Conditions Card */}
          <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5 space-y-4">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Driving Conditions & Payload
            </span>

            {/* Traffic Presets */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-400">Traffic Congestion</span>
                <span className="font-mono text-amber-400 font-bold">
                  {(trafficIntensity * 100).toFixed(0)}% Intensity
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'free', label: 'Free-flow', val: 0.10 },
                  { key: 'light', label: 'Light', val: 0.35 },
                  { key: 'moderate', label: 'Moderate', val: 0.65 },
                  { key: 'heavy', label: 'Heavy Crawl', val: 0.95 },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setTrafficLevel(t.key as any);
                      setTrafficIntensity(t.val);
                    }}
                    className={`rounded-lg py-2 text-xs font-medium border transition-all ${
                      trafficIntensity === t.val
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-[#1f2e45] bg-[#090d16] text-gray-400 hover:border-gray-600'
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
                <span className="text-gray-400">Vehicle Passenger & Cargo Load</span>
                <span className="font-mono text-blue-400 font-bold">
                  {(loadRatio * 100).toFixed(0)}% of Rated Payload
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Solo (10%)', val: 0.10 },
                  { label: '2 Ppl (30%)', val: 0.30 },
                  { label: 'Family (60%)', val: 0.60 },
                  { label: 'Full Luggage (90%)', val: 0.90 },
                ].map((l, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLoadRatio(l.val)}
                    className={`rounded-lg py-2 text-xs font-medium border transition-all ${
                      loadRatio === l.val
                        ? 'border-blue-500 bg-blue-500/15 text-blue-300 font-bold'
                        : 'border-[#1f2e45] bg-[#090d16] text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Driving Aggressiveness & Idle Time */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Driving Style (A = {aggressiveFactor} events/km)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Eco', val: 0.15 },
                    { label: 'Normal', val: 0.45 },
                    { label: 'Aggressive', val: 0.95 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setAggressiveFactor(s.val)}
                      className={`rounded py-1.5 text-[11px] border font-medium ${
                        aggressiveFactor === s.val
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-[#1f2e45] bg-[#090d16] text-gray-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Expected Idling Time</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={idleMinutes}
                  onChange={(e) => setIdleMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-1.5 text-xs font-mono text-red-400 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-500">Tolls + signals</span>
              </div>
            </div>

            {/* Fuel Price */}
            <div className="pt-2 border-t border-[#1f2e45] flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Fuel Price</span>
                <DataSourceBadge source={priceSource} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.1"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  className="w-24 rounded-lg border border-[#1f2e45] bg-[#090d16] px-2.5 py-1 text-xs font-mono text-yellow-300 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-gray-400">/ Litre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Prediction Output & Decomposition Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f2e45] pb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Predicted Trip Consumption
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Formula Output
              </span>
            </div>

            {calculating ? (
              <div className="py-16 text-center text-xs text-gray-400 font-mono">
                Calculating physics engine output...
              </div>
            ) : calcError ? (
              <div className="my-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {calcError}
              </div>
            ) : prediction && prediction.breakdown ? (
              <>
                {/* Big Metric Badges */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-4">
                    <span className="text-xs text-gray-400 block">Total Fuel Required</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">
                        {prediction.breakdown.totalFuelLiters.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">L</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-4">
                    <span className="text-xs text-gray-400 block">Estimated Cost</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-emerald-400">
                        ₹{prediction.breakdown.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-4">
                    <span className="text-xs text-gray-400 block">Effective Mileage</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-cyan-300">
                        {prediction.breakdown.effectiveMileageKmPerL.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">km/L</span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      vs {prediction.vehicle.m0} km/L baseline
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-4">
                    <span className="text-xs text-gray-400 block">Cost Per km</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-amber-300">
                        ₹{prediction.breakdown.costPerKm.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">/km</span>
                    </div>
                  </div>
                </div>

                {/* Factor Contribution Breakdown Waterfall */}
                <div className="mt-6 border-t border-[#1f2e45] pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-300 tracking-wide">
                      What's Driving This Number?
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Breakdown (Litres)
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Base Fuel Consumption (D / M₀)</span>
                      <span className="font-mono font-bold text-white">
                        {prediction.breakdown.baseFuelLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-400">
                      <span>+ Speed Drag Resistance (kv·V²)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.speedTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-amber-400">
                      <span>+ Traffic Delays & Stop-and-Go (kt·T)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.trafficTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-blue-400">
                      <span>+ Vehicle Payload Resistance (kl·L)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.loadTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-rose-400">
                      <span>+ Aggressive Driving Acceleration (ka·A)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.aggressiveTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-purple-400">
                      <span>+ Road Gradient Elevation (kg·G)</span>
                      <span className="font-mono font-bold">
                        {prediction.breakdown.gradientTermLiters >= 0 ? '+' : ''}
                        {prediction.breakdown.gradientTermLiters.toFixed(2)} L
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-red-400">
                      <span>+ Idling Consumption (ki·t_idle)</span>
                      <span className="font-mono font-bold">
                        +{prediction.breakdown.idleTermLiters.toFixed(2)} L
                      </span>
                    </div>
                  </div>
                </div>

                {/* Model Attribution Badge */}
                <div className="mt-6 rounded-lg border border-[#1f2e45] bg-[#090d16] p-3 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Calculation Provenance</span>
                  </div>
                  <p className="mt-1">
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
        <div className="py-20 text-center text-gray-400 font-mono text-sm">
          Loading trip predictor...
        </div>
      }
    >
      <TripPlannerContent />
    </Suspense>
  );
}
