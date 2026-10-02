'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Database,
  Info,
  Car,
  TrendingUp,
  Cpu,
  BarChart3,
  Clock,
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
  const loadCalibration = (vehicleId: string) => {
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
  };

  useEffect(() => {
    if (selectedVehicleId) {
      loadCalibration(selectedVehicleId);
    }
  }, [selectedVehicleId]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2e45] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              OLS CALIBRATION ENGINE
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Model Calibration & Statistical Audit
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Transparently monitor fitted regression coefficients, statistical goodness of fit (R²), and holdout test error.
          </p>
        </div>

        {/* Vehicle Selector */}
        {vehicles.length > 0 && (
          <div className="w-full sm:w-72">
            <label className="block text-[11px] text-gray-400 mb-1">Select Vehicle Profile</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full rounded-lg border border-[#1f2e45] bg-[#111827] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.tripCount} trips)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {feedbackMessage && (
        <div
          className={`mt-6 rounded-xl border p-4 text-xs font-semibold ${
            feedbackMessage.startsWith('Error')
              ? 'border-red-500/40 bg-red-500/10 text-red-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {feedbackMessage}
        </div>
      )}

      {loading || !calibrationData ? (
        <div className="py-20 text-center text-gray-400 font-mono text-sm">
          Loading calibration statistics and coefficient history...
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Top Status Card */}
          <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">
                    {calibrationData.vehicle.name}
                  </h2>
                  <ModelStatusBadge
                    isCalibrated={!coeffs?.isDefault && calibrationData.canCalibrate}
                    version={coeffs?.version}
                    sampleSize={coeffs?.sampleSize}
                    tripsCount={calibrationData.tripsCount}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {calibrationData.canCalibrate
                    ? `Fitted against ${calibrationData.tripsCount} stored database rows. 20% holdout validation evaluated.`
                    : `Currently utilizing population baseline coefficients. Need ${calibrationData.tripsNeeded} more real trips to unlock personal OLS fitting.`}
                </p>
                {coeffs?.createdAt && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
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
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${recalibrating ? 'animate-spin' : ''}`} />
                  {recalibrating ? 'Running OLS Matrix Regression...' : 'Recalibrate Personal Model'}
                </button>
              </div>
            </div>

            {/* Regression Metrics Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#1f2e45] pt-6">
              <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-4 text-center">
                <span className="text-xs text-gray-400 block">Test Holdout R²</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {metrics?.rSquared != null ? metrics.rSquared.toFixed(3) : 'N/A'}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  1.0 = Perfect physical fit
                </span>
              </div>

              <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-4 text-center">
                <span className="text-xs text-gray-400 block">Mean Absolute Error (MAE)</span>
                <span className="text-3xl font-extrabold text-cyan-300 font-mono">
                  {metrics?.mae != null ? `${metrics.mae.toFixed(2)}` : 'N/A'}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Litres average error
                </span>
              </div>

              <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-4 text-center">
                <span className="text-xs text-gray-400 block">Mean Abs Pct Error (MAPE)</span>
                <span className="text-3xl font-extrabold text-amber-300 font-mono">
                  {metrics?.mape != null ? `${metrics.mape.toFixed(1)}%` : 'N/A'}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  % deviation on test trips
                </span>
              </div>

              <div className="rounded-xl border border-[#1f2e45] bg-[#090d16] p-4 text-center">
                <span className="text-xs text-gray-400 block">Dataset Sample Split</span>
                <span className="text-2xl font-bold text-white font-mono mt-1 block">
                  {metrics?.trainSampleSize ?? Math.max(0, calibrationData.tripsCount - 2)} /{' '}
                  {metrics?.testSampleSize ?? Math.min(2, calibrationData.tripsCount)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Train Trips / Holdout Test Trips
                </span>
              </div>
            </div>
          </div>

          {/* Active Mathematical Coefficients Detailed Breakdown */}
          <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1f2e45] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Fitted Physical Coefficients Table (v{coeffs?.version})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Units, physical interpretation, and values fitted by Ordinary Least Squares.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {coeffs?.isDefault ? 'Population Defaults' : 'OLS Calibrated'}
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#1f2e45] bg-[#090d16] font-mono text-gray-400 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4">Physical Factor</th>
                    <th className="py-3 px-4">Fitted Value</th>
                    <th className="py-3 px-4">SI / Physical Unit</th>
                    <th className="py-3 px-4">Physical Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2e45] text-gray-300 font-mono">
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-400">kᵥ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Aerodynamic Drag</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.kv.toFixed(7)}</td>
                    <td className="py-3 px-4 text-gray-400">(km/h)⁻²</td>
                    <td className="py-3 px-4 font-sans text-gray-400">
                      Scales fuel consumption quadratically with average vehicle speed.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-amber-400">kₜ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Traffic Congestion</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.kt.toFixed(5)}</td>
                    <td className="py-3 px-4 text-gray-400">unitless [0-1]</td>
                    <td className="py-3 px-4 font-sans text-gray-400">
                      Stop-and-go acceleration losses normalized from 0.0 (open) to 1.0 (gridlock).
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-blue-400">kₗ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Payload Mass Penalty</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.kl.toFixed(5)}</td>
                    <td className="py-3 px-4 text-gray-400">ratio [0-1]</td>
                    <td className="py-3 px-4 font-sans text-gray-400">
                      Rolling resistance penalty per fraction of maximum rated vehicle payload.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-400">kₐ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Driving Aggressiveness</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.ka.toFixed(5)}</td>
                    <td className="py-3 px-4 text-gray-400">(events/km)⁻¹</td>
                    <td className="py-3 px-4 font-sans text-gray-400">
                      Kinetic energy waste from hard acceleration and harsh braking spikes.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-purple-400">k_g</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Road Gradient Slope</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.kg.toFixed(5)}</td>
                    <td className="py-3 px-4 text-gray-400">gradient⁻¹</td>
                    <td className="py-3 px-4 font-sans text-gray-400">
                      Gravitational potential energy required per % road incline or decline.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-red-400">kᵢ</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">Engine Idling Rate</td>
                    <td className="py-3 px-4 font-bold text-white">{coeffs?.ki.toFixed(5)}</td>
                    <td className="py-3 px-4 text-gray-400">Litres / minute</td>
                    <td className="py-3 px-4 font-sans text-gray-400">
                      Static auxiliary fuel burn rate during signals, traffic stops, and warm-ups.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Version History Table */}
          {calibrationData.coefficientHistory && calibrationData.coefficientHistory.length > 0 && (
            <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-2">Calibration Version History</h3>
              <p className="text-xs text-gray-400 mb-6">
                Audit trail showing how personal model coefficients and statistical accuracy evolve as more trips are logged.
              </p>

              <div className="space-y-3">
                {calibrationData.coefficientHistory.map((h: any) => (
                  <div
                    key={h.id || h.version}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#1f2e45] bg-[#090d16] p-4 text-xs font-mono gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          Version {h.version}
                        </span>
                        <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] text-gray-300">
                          {h.isDefault ? 'Population Defaults' : `${h.sampleSize} trips sample`}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 font-sans block mt-1">
                        {h.notes || 'Routine calibration refit'}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-[11px]">
                      <div>
                        <span className="text-gray-500 block">R² Score</span>
                        <span className="text-emerald-400 font-bold">
                          {h.rSquared != null ? h.rSquared.toFixed(3) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">MAE</span>
                        <span className="text-cyan-300 font-bold">
                          {h.mae != null ? `${h.mae.toFixed(2)} L` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">MAPE</span>
                        <span className="text-amber-300 font-bold">
                          {h.mape != null ? `${h.mape.toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Date</span>
                        <span className="text-gray-400">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
        <div className="py-20 text-center text-gray-400 font-mono text-sm">
          Loading calibration data...
        </div>
      }
    >
      <CalibrationContent />
    </Suspense>
  );
}
