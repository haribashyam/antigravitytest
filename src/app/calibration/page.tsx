'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sliders,
  RotateCcw,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { ModelStatusBadge } from '@/components/Badges';

interface CalibrationData {
  vehicle: {
    id: string;
    name: string;
    make: string;
    model: string;
    year: number;
    m0: number;
  };
  tripsCount: number;
  canCalibrate: boolean;
  tripsNeeded: number;
  activeCoefficients: {
    id?: string;
    version: number;
    kv: number;
    kt: number;
    kl: number;
    ka: number;
    kg: number;
    ki: number;
    isDefault: boolean;
    sampleSize: number;
    rSquared?: number | null;
    mae?: number | null;
    mape?: number | null;
    notes?: string;
    createdAt?: string;
  };
  coefficientHistory: any[];
  metrics: {
    rSquared: number | null;
    mae: number | null;
    mape: number | null;
    trainSampleSize?: number;
    testSampleSize?: number;
  };
  testPredictions?: Array<{
    tripId: string;
    actualFuelLitres: number;
    predictedFuelLitres: number;
    errorLitres: number;
  }>;
}

function CalibrationContent() {
  const searchParams = useSearchParams();
  const queryVehicleId = searchParams.get('vehicleId');

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(queryVehicleId || '');
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalibrating, setRecalibrating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Fetch list of vehicles
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
      .catch(console.error);
  }, [selectedVehicleId]);

  // Fetch calibration details for selected vehicle
  const loadCalibration = React.useCallback((vehicleId: string) => {
    if (!vehicleId) return;
    setLoading(true);
    fetch(`/api/calibration/${vehicleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCalibrationData(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedVehicleId) {
      loadCalibration(selectedVehicleId);
    }
  }, [selectedVehicleId, loadCalibration]);

  const handleRecalibrate = async () => {
    if (!selectedVehicleId) return;
    setRecalibrating(true);
    setFeedbackMessage('');

    try {
      const res = await fetch(`/api/calibration/${selectedVehicleId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Calibration failed');
      }

      setFeedbackMessage('Successfully recalibrated model using Ordinary Least Squares!');
      loadCalibration(selectedVehicleId);
    } catch (err: any) {
      setFeedbackMessage('Error: ' + err.message);
    } finally {
      setRecalibrating(false);
    }
  };

  const coeffs = calibrationData?.activeCoefficients;
  const metrics = calibrationData?.metrics;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* visionOS Window Header */}
      <div className="visionos-window p-6 sm:p-8 mb-8">
        <div className="visionos-grab-bar" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/12 border border-purple-400/25 px-3 py-0.5 text-[11px] font-semibold text-purple-300">
                <Sparkles className="h-3 w-3" />
                visionOS Matrix Calibration Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Sliders className="h-7 w-7 text-purple-400" />
              OLS Calibration & Statistical Audit
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Audit fitted mathematical coefficients, goodness-of-fit R², and independent holdout test validation.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div className="w-full sm:w-72">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Active Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full visionos-input cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#0b101d] text-white">
                    {v.name} ({v.tripCount} trips)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`mb-8 visionos-window p-4 text-xs font-semibold ${
            feedbackMessage.startsWith('Error')
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {feedbackMessage}
        </div>
      )}

      {loading || !calibrationData ? (
        <div className="py-24 text-center text-slate-400 font-mono text-xs">
          Loading calibration statistics and coefficient history...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Status Card */}
          <div className="visionos-window p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {calibrationData.vehicle.name}
                  </h2>
                  <ModelStatusBadge
                    isCalibrated={!coeffs?.isDefault && calibrationData.canCalibrate}
                    version={coeffs?.version}
                    sampleSize={coeffs?.sampleSize}
                    tripsCount={calibrationData.tripsCount}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  {calibrationData.canCalibrate
                    ? `Fitted against ${calibrationData.tripsCount} stored database rows. 20% holdout validation evaluated.`
                    : `Currently utilizing population baseline coefficients. Need ${calibrationData.tripsNeeded} more real trips to unlock personal OLS fitting.`}
                </p>
                {coeffs?.createdAt && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>Last Recalibrated: {new Date(coeffs.createdAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRecalibrate}
                  disabled={!calibrationData.canCalibrate || recalibrating}
                  className="visionos-pill-btn-primary py-2.5 px-4 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${recalibrating ? 'animate-spin' : ''}`} />
                  <span>{recalibrating ? 'Running OLS Matrix Regression...' : 'Recalibrate Personal Model'}</span>
                </button>
              </div>
            </div>

            {/* Regression Metrics Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08] pt-6">
              <div className="visionos-panel p-4 text-center">
                <span className="text-xs text-slate-400 block font-medium">Test Holdout R²</span>
                <span className="text-3xl font-extrabold text-emerald-400 glow-green font-mono mt-1 block">
                  {metrics?.rSquared != null ? metrics.rSquared.toFixed(3) : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  1.0 = Perfect physical fit
                </span>
              </div>

              <div className="visionos-panel p-4 text-center">
                <span className="text-xs text-slate-400 block font-medium">Mean Absolute Error (MAE)</span>
                <span className="text-3xl font-extrabold text-cyan-300 font-mono mt-1 block">
                  {metrics?.mae != null ? `${metrics.mae.toFixed(2)}` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Litres average error
                </span>
              </div>

              <div className="visionos-panel p-4 text-center">
                <span className="text-xs text-slate-400 block font-medium">Mean Abs % Error (MAPE)</span>
                <span className="text-3xl font-extrabold text-amber-300 font-mono mt-1 block">
                  {metrics?.mape != null ? `${metrics.mape.toFixed(1)}%` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  % deviation on test trips
                </span>
              </div>

              <div className="visionos-panel p-4 text-center">
                <span className="text-xs text-slate-400 block font-medium">Dataset Sample Split</span>
                <span className="text-2xl font-bold text-white font-mono mt-2 block">
                  {metrics?.trainSampleSize ?? Math.max(0, calibrationData.tripsCount - 2)} /{' '}
                  {metrics?.testSampleSize ?? Math.min(2, calibrationData.tripsCount)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Train Trips / Test Trips
                </span>
              </div>
            </div>
          </div>

          {/* Active Mathematical Coefficients Detailed Breakdown */}
          <div className="visionos-window p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Fitted Physical Coefficients (v{coeffs?.version})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Physical dimensions, SI units, and values solved via QR / pseudoinverse matrix equations.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/25">
                {coeffs?.isDefault ? 'Population Defaults' : 'OLS Calibrated'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-slate-400 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4">Physical Factor</th>
                    <th className="py-3 px-4">Fitted Value</th>
                    <th className="py-3 px-4">Physical Unit</th>
                    <th className="py-3 px-4">Physical Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300 font-mono">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-emerald-400">kᵥ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Aerodynamic Drag</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.kv.toFixed(7)}</td>
                    <td className="py-3 px-4 text-slate-400">(km/h)⁻²</td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      Scales fuel consumption quadratically with average vehicle speed ($V^2$).
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-amber-400">kₜ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Traffic Congestion</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.kt.toFixed(5)}</td>
                    <td className="py-3 px-4 text-slate-400">ratio [0-1]</td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      Stop-and-go acceleration losses normalized from 0.0 (open) to 1.0 (gridlock).
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-blue-400">kₗ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Payload Mass Penalty</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.kl.toFixed(5)}</td>
                    <td className="py-3 px-4 text-slate-400">ratio [0-1]</td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      Rolling resistance penalty per fraction of maximum rated vehicle payload.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-rose-400">kₐ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Driving Aggressiveness</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.ka.toFixed(5)}</td>
                    <td className="py-3 px-4 text-slate-400">(events/km)⁻¹</td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      Kinetic energy waste from hard acceleration and harsh braking spikes.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-purple-400">k_g</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Road Gradient Slope</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.kg.toFixed(5)}</td>
                    <td className="py-3 px-4 text-slate-400">gradient⁻¹</td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      Gravitational potential energy required per % road incline or decline.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-rose-400">kᵢ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Engine Idling Rate</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.ki.toFixed(5)}</td>
                    <td className="py-3 px-4 text-slate-400">Litres / minute</td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      Static auxiliary fuel burn rate during signals, traffic stops, and warm-ups.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Version History Table */}
          {calibrationData.coefficientHistory && calibrationData.coefficientHistory.length > 0 && (
            <div className="visionos-window p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                Calibration Version Evolution
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Audit trail showing how personal model coefficients and statistical accuracy evolve as more trips are logged.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-slate-400 uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Version</th>
                      <th className="py-3 px-4">Sample Size</th>
                      <th className="py-3 px-4">R²</th>
                      <th className="py-3 px-4">MAE</th>
                      <th className="py-3 px-4">MAPE</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono text-slate-300">
                    {calibrationData.coefficientHistory.map((h, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-emerald-400 font-bold">v{h.version}</td>
                        <td className="py-3 px-4">{h.sampleSize} trips</td>
                        <td className="py-3 px-4 text-white font-semibold">
                          {h.rSquared != null ? h.rSquared.toFixed(3) : '—'}
                        </td>
                        <td className="py-3 px-4">{h.mae != null ? `${h.mae.toFixed(2)} L` : '—'}</td>
                        <td className="py-3 px-4">{h.mape != null ? `${h.mape.toFixed(1)}%` : '—'}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CalibrationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-400 font-mono text-sm">
          Loading calibration suite...
        </div>
      }
    >
      <CalibrationContent />
    </Suspense>
  );
}
