'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Sliders,
  CheckCircle2,
  Play,
  Square,
  Radio,
  Sparkles,
  Activity,
  Compass,
} from 'lucide-react';
import {
  predictFuelConsumption,
  POPULATION_BASELINE_COEFFICIENTS,
  TripInput,
} from '@/lib/fuelModel';
import { DataSourceBadge } from '@/components/Badges';
import { authFetch } from '@/lib/apiClient';

interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  fuelType?: string;
  m0: number;
  ratedPayloadKg: number;
  tripCount: number;
  isCalibrated: boolean;
  activeCoefficients: any;
}

export default function NewTripPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'live_gps'>('manual');
  const [, setLoading] = useState(true);

  // Form Fields
  const [tripName, setTripName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | ''>(35.0);
  const [fuelUsedLitres, setFuelUsedLitres] = useState<number | ''>(2.8);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState<number | ''>(55);
  const [trafficIntensity, setTrafficIntensity] = useState(0.4);
  const [loadRatio, setLoadRatio] = useState(0.3);
  const [hardAccelEvents, setHardAccelEvents] = useState(2);
  const [hardBrakeEvents, setHardBrakeEvents] = useState(1);
  const [gradientPercent, setGradientPercent] = useState(0.5);
  const [idleMinutes, setIdleMinutes] = useState(8);
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState(102.5);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<any>(null);

  // Live GPS Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [, setGpsSupported] = useState(true);
  const [gpsError, setGpsError] = useState('');
  const [trackedDistanceKm, setTrackedDistanceKm] = useState(0);
  const [trackedSpeedKmh, setTrackedSpeedKmh] = useState(0);
  const [, setTopSpeedKmh] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveIdleMinutes, setLiveIdleMinutes] = useState(0);
  const [detectedHarshEvents, setDetectedHarshEvents] = useState(0);

  const prevCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    authFetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        const vList = data.vehicles || [];
        setVehicles(vList);
        if (vList.length > 0) {
          setSelectedVehicleId(vList[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Check Geolocation support
    if (typeof window !== 'undefined' && !('geolocation' in navigator)) {
      setGpsSupported(false);
    }
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Haversine formula to compute distance between GPS points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Start live GPS & DeviceMotion tracking
  const startTracking = () => {
    setGpsError('');
    setIsTracking(true);
    setTrackedDistanceKm(0);
    setTrackedSpeedKmh(0);
    setTopSpeedKmh(0);
    setElapsedSeconds(0);
    setLiveIdleMinutes(0);
    setDetectedHarshEvents(0);
    prevCoordsRef.current = null;

    // Start timer for duration & idle detection
    timerRef.current = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
      // If current speed is < 3 km/h, count as idling
      setTrackedSpeedKmh((speed) => {
        if (speed < 3) {
          setLiveIdleMinutes((m) => Number((m + 1 / 60).toFixed(2)));
        }
        return speed;
      });
    }, 1000);

    // Watch position
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speed = pos.coords.speed != null ? pos.coords.speed * 3.6 : 0; // m/s to km/h

          setTrackedSpeedKmh(Number(speed.toFixed(1)));
          setTopSpeedKmh((top) => Math.max(top, Number(speed.toFixed(1))));

          if (prevCoordsRef.current) {
            const distDelta = calculateDistance(
              prevCoordsRef.current.lat,
              prevCoordsRef.current.lng,
              lat,
              lng
            );
            if (distDelta > 0.005) {
              // filter GPS jitter under 5 meters
              setTrackedDistanceKm((prev) => Number((prev + distDelta).toFixed(2)));
              prevCoordsRef.current = { lat, lng };
            }
          } else {
            prevCoordsRef.current = { lat, lng };
          }
        },
        (err) => {
          setGpsError('GPS sensor error: ' + err.message);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }

    // Accelerometer / DeviceMotion listener
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acc = event.acceleration || event.accelerationIncludingGravity;
        if (acc && acc.x != null && acc.y != null && acc.z != null) {
          const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
          // Sudden deceleration or acceleration spike above 14 m/s²
          if (mag > 14) {
            setDetectedHarshEvents((c) => c + 1);
          }
        }
      };
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Populate manual entry form with tracked telemetry
    const durationHours = elapsedSeconds / 3600;
    const computedAvgSpeed =
      durationHours > 0 && trackedDistanceKm > 0
        ? Number((trackedDistanceKm / durationHours).toFixed(1))
        : 45;

    setDistanceKm(trackedDistanceKm > 0 ? trackedDistanceKm : 10.0);
    setAvgSpeedKmh(computedAvgSpeed);
    setIdleMinutes(Number(liveIdleMinutes.toFixed(1)));
    setHardAccelEvents(Math.ceil(detectedHarshEvents / 2));
    setHardBrakeEvents(Math.floor(detectedHarshEvents / 2));
    setActiveTab('manual');
  };

  // Dynamic preview calculation
  const previewPrediction = React.useMemo(() => {
    if (!selectedVehicle || !distanceKm || !avgSpeedKmh || Number(distanceKm) <= 0) return null;
    try {
      const D = Number(distanceKm);
      const V = Number(avgSpeedKmh);
      const A = D > 0 ? (hardAccelEvents + hardBrakeEvents) / D : 0;
      const input: TripInput = {
        distanceKm: D,
        baseMileageKmPerL: selectedVehicle.m0,
        avgSpeedKmh: V,
        trafficIntensity,
        loadRatio,
        aggressiveFactor: A,
        gradientDecimal: gradientPercent / 100,
        idleMinutes: Number(idleMinutes),
      };
      const coeffs = selectedVehicle.activeCoefficients || POPULATION_BASELINE_COEFFICIENTS;
      return predictFuelConsumption(input, coeffs);
    } catch {
      return null;
    }
  }, [
    selectedVehicle,
    distanceKm,
    avgSpeedKmh,
    trafficIntensity,
    loadRatio,
    hardAccelEvents,
    hardBrakeEvents,
    gradientPercent,
    idleMinutes,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessInfo(null);
    setSubmitting(true);

    if (!selectedVehicleId) {
      setError('Please select a vehicle');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        vehicleId: selectedVehicleId,
        tripName: tripName.trim() || `${origin || 'Trip'} to ${destination || 'Destination'}`,
        origin: origin || undefined,
        destination: destination || undefined,
        distanceKm: Number(distanceKm),
        fuelUsedLitres: Number(fuelUsedLitres),
        avgSpeedKmh: Number(avgSpeedKmh),
        trafficIntensity: Number(trafficIntensity),
        loadRatio: Number(loadRatio),
        hardAccelEvents: Number(hardAccelEvents),
        hardBrakeEvents: Number(hardBrakeEvents),
        gradientDecimal: Number(gradientPercent) / 100,
        idleMinutes: Number(idleMinutes),
        fuelPricePerLitre: Number(fuelPricePerLitre),
        dataSource: activeTab === 'live_gps' ? 'gps_live' : 'manual',
        notes: notes || undefined,
      };

      const res = await authFetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please sign in or create an account to log trips to your personal garage.');
        }
        throw new Error(data.error || 'Failed to log trip');
      }

      setSuccessInfo(data);
      // Reset form fields
      setTripName('');
      setFuelUsedLitres('');
      setNotes('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* visionOS Window Header */}
      <div className="visionos-window p-6 sm:p-8 mb-8">
        <div className="visionos-grab-bar" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 border border-emerald-400/25 px-3 py-0.5 text-[11px] font-semibold text-emerald-300">
                <Sparkles className="h-3 w-3" />
                visionOS Telemetry Recording
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Activity className="h-7 w-7 text-emerald-400" />
              Log Driving Journey
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Ingest real trip distance, speeds, and pump fuel amounts to train the vehicle&apos;s OLS calibration matrix.
            </p>
          </div>
        </div>

        {/* Floating Segmented Mode Control */}
        <div className="mt-6 flex items-center p-1 rounded-full bg-white/[0.05] border border-white/[0.1] max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-white/20 text-white shadow-sm shadow-black/30 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Comprehensive Telemetry Form</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live_gps')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'live_gps'
                ? 'bg-cyan-500/25 text-cyan-300 shadow-sm shadow-cyan-500/20 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Live In-Browser GPS Tracker</span>
          </button>
        </div>
      </div>

      {/* Recalibration Success Banner */}
      {successInfo && (
        <div className="visionos-window mb-8 p-6 border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-base">Trip Logged Successfully!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Actual Fuel: <span className="font-mono font-bold text-white">{successInfo.trip.fuelUsedLitres} L</span> |{' '}
                  Predicted: <span className="font-mono font-bold text-white">{successInfo.trip.predictedFuelLitres} L</span> |{' '}
                  Cost: <span className="font-mono text-emerald-300 font-bold">₹{successInfo.trip.actualCost}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/trips')}
              className="visionos-pill-btn-primary py-2 px-4 text-xs font-semibold"
            >
              View in History →
            </button>
          </div>

          {successInfo.recalibrated && (
            <div className="mt-4 visionos-panel p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>Personal OLS Model Recalibrated (v{successInfo.activeCoefficients.version})</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your model was refitted against {successInfo.activeCoefficients.sampleSize} stored trips.
                Test R²: <span className="text-white font-mono">{successInfo.activeCoefficients.rSquared}</span> |{' '}
                MAE: <span className="text-white font-mono">{successInfo.activeCoefficients.mae} L</span> |{' '}
                MAPE: <span className="text-white font-mono">{successInfo.activeCoefficients.mape}%</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Live In-Browser GPS Tracker */}
      {activeTab === 'live_gps' && (
        <div className="visionos-window p-8 mb-8">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Live In-Vehicle Telemetry Tracker</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Uses HTML5 Geolocation and device accelerometer to compute distance, speed, and idle periods in real time.
              </p>
            </div>
            <DataSourceBadge source="gps_live" />
          </div>

          {gpsError && (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              {gpsError}
            </div>
          )}

          {/* Telemetry Dashboard Meters */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="visionos-panel p-4 text-center">
              <span className="text-xs text-slate-400 block font-medium">Distance Covered</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-1 block">
                {trackedDistanceKm.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block uppercase">km</span>
            </div>

            <div className="visionos-panel p-4 text-center">
              <span className="text-xs text-slate-400 block font-medium">Current Speed</span>
              <span className="text-3xl font-extrabold text-cyan-300 font-mono mt-1 block">
                {trackedSpeedKmh}
              </span>
              <span className="text-[10px] text-slate-500 block uppercase">km/h</span>
            </div>

            <div className="visionos-panel p-4 text-center">
              <span className="text-xs text-slate-400 block font-medium">Duration Elapsed</span>
              <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
                {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-500 block uppercase">min:sec</span>
            </div>

            <div className="visionos-panel p-4 text-center">
              <span className="text-xs text-slate-400 block font-medium">Idling Duration</span>
              <span className="text-3xl font-extrabold text-amber-300 font-mono mt-1 block">
                {liveIdleMinutes.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 block uppercase">min (&lt;3 km/h)</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="visionos-pill-btn-primary py-3.5 px-8 text-sm font-bold"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Live Telemetry Recording</span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/20 px-8 py-3.5 text-sm font-bold text-rose-300 hover:bg-rose-500/30 transition-all animate-pulse"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>Finish Drive & Populate Form</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Comprehensive Trip Form */}
      {activeTab === 'manual' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Vehicle Selection Card */}
          <div className="visionos-window p-6">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              1. Select Vehicle
            </label>
            {vehicles.length === 0 ? (
              <p className="text-xs text-amber-400">
                No vehicles found.{' '}
                <a href="/vehicles" className="underline">
                  Please add a vehicle first.
                </a>
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      selectedVehicleId === v.id
                        ? 'border-emerald-400 bg-emerald-500/15 text-white ring-1 ring-emerald-400/30 shadow-md'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm">{v.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                        {v.fuelType}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-slate-400 flex justify-between border-t border-white/[0.06] pt-2">
                      <span>M₀: <strong className="text-white font-mono">{v.m0} km/L</strong></span>
                      <span>{v.tripCount} trips logged</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Route & Distance Card */}
          <div className="visionos-window p-6 space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Route & Measured Consumptions
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Trip / Route Name</label>
                <input
                  type="text"
                  required
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="e.g. Pune Highway Expressway"
                  className="w-full visionos-input"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0.1"
                  value={distanceKm}
                  onChange={(e) =>
                    setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full visionos-input font-mono text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Actual Fuel Used (Litres)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={fuelUsedLitres}
                  onChange={(e) =>
                    setFuelUsedLitres(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="From tank-to-tank pump receipt"
                  className="w-full visionos-input font-mono text-cyan-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Origin (Optional)</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full visionos-input"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Destination (Optional)</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Pune"
                  className="w-full visionos-input"
                />
              </div>
            </div>
          </div>

          {/* Driving Parameters Card */}
          <div className="visionos-window p-6 space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              3. Driving Parameters & Route Factors
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Average Speed */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Average Speed (V)</span>
                  <span className="text-white font-mono font-bold bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full text-[10px]">
                    {avgSpeedKmh || 0} km/h
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="130"
                  step="5"
                  value={avgSpeedKmh || 50}
                  onChange={(e) => setAvgSpeedKmh(Number(e.target.value))}
                  className="w-full slider-cyan"
                />
              </div>

              {/* Traffic Intensity */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Traffic Level (T)</span>
                  <span className="text-amber-300 font-mono font-bold bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full text-[10px]">
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
                  className="w-full slider-amber"
                />
              </div>

              {/* Load Ratio */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Payload Load (L)</span>
                  <span className="text-blue-300 font-mono font-bold bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full text-[10px]">
                    {(loadRatio * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={loadRatio}
                  onChange={(e) => setLoadRatio(Number(e.target.value))}
                  className="w-full slider-purple"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Hard Accel Events</label>
                <input
                  type="number"
                  min="0"
                  value={hardAccelEvents}
                  onChange={(e) => setHardAccelEvents(Number(e.target.value))}
                  className="w-full visionos-input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Hard Brake Events</label>
                <input
                  type="number"
                  min="0"
                  value={hardBrakeEvents}
                  onChange={(e) => setHardBrakeEvents(Number(e.target.value))}
                  className="w-full visionos-input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Road Gradient (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={gradientPercent}
                  onChange={(e) => setGradientPercent(Number(e.target.value))}
                  placeholder="0.0"
                  className="w-full visionos-input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Idle Time (min)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={idleMinutes}
                  onChange={(e) => setIdleMinutes(Number(e.target.value))}
                  className="w-full visionos-input font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs text-slate-400 mb-1">
                Fuel Price (₹/Litre at time of trip)
              </label>
              <input
                type="number"
                step="0.1"
                min="10"
                value={fuelPricePerLitre}
                onChange={(e) => setFuelPricePerLitre(Number(e.target.value))}
                className="w-48 visionos-input font-mono text-amber-300"
              />
            </div>
          </div>

          {/* Model Prediction Live Comparison Callout */}
          {previewPrediction && fuelUsedLitres !== '' && Number(fuelUsedLitres) > 0 && (
            <div className="visionos-window p-5">
              <span className="font-semibold text-slate-200 block mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-emerald-400" />
                Live Telemetry vs Model Prediction
              </span>
              <div className="grid grid-cols-3 gap-4">
                <div className="visionos-panel p-3 text-center">
                  <span className="text-slate-400 block text-[10px] font-medium">Actual Measured</span>
                  <span className="text-white font-mono font-bold text-base mt-1 block">
                    {Number(fuelUsedLitres).toFixed(2)} L
                  </span>
                </div>
                <div className="visionos-panel p-3 text-center">
                  <span className="text-slate-400 block text-[10px] font-medium">Model Predicted</span>
                  <span className="text-emerald-400 font-mono font-bold text-base mt-1 block">
                    {previewPrediction.totalFuelLiters.toFixed(2)} L
                  </span>
                </div>
                <div className="visionos-panel p-3 text-center">
                  <span className="text-slate-400 block text-[10px] font-medium">Residual Difference</span>
                  <span
                    className={`font-mono font-bold text-base mt-1 block ${
                      Math.abs(Number(fuelUsedLitres) - previewPrediction.totalFuelLiters) < 0.3
                        ? 'text-emerald-400'
                        : 'text-amber-300'
                    }`}
                  >
                    {(Number(fuelUsedLitres) - previewPrediction.totalFuelLiters).toFixed(2)} L
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="visionos-pill-btn-primary w-full py-3.5 text-center justify-center text-sm font-semibold disabled:opacity-50"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{submitting ? 'Recording Trip & Evaluating OLS...' : 'Save Journey to Database'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
