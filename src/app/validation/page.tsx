'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BarChart3,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';

interface ScatterPoint {
  tripId: string;
  tripName: string;
  vehicleName: string;
  distanceKm: number;
  actualFuelLitres: number;
  predictedFuelLitres: number;
  errorLitres: number;
  absPctError: number;
  date: string;
}

interface ValidationData {
  tripsCount: number;
  points: ScatterPoint[];
  metrics: {
    rSquared: number;
    mae: number;
    mape: number;
    meanError: number;
  };
  residualsHistogram: Array<{ label: string; count: number }>;
}

export default function ValidationPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [data, setData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((d) => setVehicles(d.vehicles || []))
      .catch(console.error);
  }, []);

  const loadData = React.useCallback(() => {
    setLoading(true);
    const query = selectedVehicleId ? `?vehicleId=${selectedVehicleId}` : '';
    fetch(`/api/validation${query}`)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedVehicleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute domain max for 45-degree reference line
  const maxFuel = React.useMemo(() => {
    if (!data || data.points.length === 0) return 20;
    const maxVal = Math.max(
      ...data.points.map((p) => Math.max(p.actualFuelLitres, p.predictedFuelLitres))
    );
    return Math.ceil(maxVal * 1.15);
  }, [data]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* visionOS Window Header */}
      <div className="visionos-window p-6 sm:p-8 mb-8">
        <div className="visionos-grab-bar" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 border border-emerald-400/25 px-3 py-0.5 text-[11px] font-semibold text-emerald-300">
                <Sparkles className="h-3 w-3" />
                visionOS Empirical Validation Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <BarChart3 className="h-7 w-7 text-emerald-400" />
              Predicted vs Actual Accuracy Audit
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Audit actual pump fuel readings against model estimations across individual journey data points.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div className="w-full sm:w-64">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Filter Fleet
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full visionos-input text-xs cursor-pointer"
              >
                <option value="" className="bg-[#0b101d] text-white">All Fleet Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#0b101d] text-white">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading || !data ? (
        <div className="py-24 text-center font-mono text-xs text-slate-400">
          Calculating statistical correlation from stored trip records...
        </div>
      ) : data.tripsCount === 0 ? (
        <div className="visionos-window p-16 text-center text-slate-400">
          No trip logs with actual fuel available for validation.{' '}
          <a href="/trips/new" className="text-emerald-400 underline ml-1">
            Log your first trip now.
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="visionos-panel p-4 text-center">
              <span className="text-xs text-slate-400 block font-medium">Overall R² Correlation</span>
              <span className="text-3xl font-extrabold text-emerald-400 glow-green font-mono mt-1 block">
                {data.metrics.rSquared.toFixed(3)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Closer to 1.0 = higher accuracy
              </span>
            </div>

            <div className="visionos-panel p-4 text-center">
              <span className="text-xs text-slate-400 block font-medium">Mean Absolute Error (MAE)</span>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold text-cyan-300 font-mono">
                  {data.metrics.mae.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-mono">L</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Avg deviation per trip
              </span>
            </div>

            <div className="visionos-panel p-4 text-center">
              <span className="text-xs text-slate-400 block font-medium">Mean Abs % Error (MAPE)</span>
              <span className="text-3xl font-extrabold text-amber-300 font-mono mt-1 block">
                {data.metrics.mape.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Average percentage error
              </span>
            </div>

            <div className="visionos-panel p-4 text-center">
              <span className="text-xs text-slate-400 block font-medium">Validated Trips</span>
              <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
                {data.tripsCount}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Total real trips in dataset
              </span>
            </div>
          </div>

          {/* Scatter Plot: Predicted vs Actual */}
          <div className="visionos-window p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Predicted vs Actual Scatter Correlation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Points along the 45° green diagonal line reflect high physical model alignment.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/25 self-start sm:self-auto">
                Diagonal = Perfect Fit (Y = X)
              </span>
            </div>

            <div className="mt-6 h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    type="number"
                    dataKey="predictedFuelLitres"
                    name="Predicted Fuel"
                    unit=" L"
                    stroke="#94a3b8"
                    domain={[0, maxFuel]}
                    label={{
                      value: 'Predicted Fuel (Litres)',
                      position: 'insideBottom',
                      offset: -15,
                      fill: '#94a3b8',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="actualFuelLitres"
                    name="Actual Fuel"
                    unit=" L"
                    stroke="#94a3b8"
                    domain={[0, maxFuel]}
                    label={{
                      value: 'Actual Fuel (Litres)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#94a3b8',
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload as ScatterPoint;
                        return (
                          <div className="visionos-window p-3 text-xs shadow-xl min-w-[200px]">
                            <span className="font-bold text-white block mb-1">{pt.tripName}</span>
                            <span className="text-slate-400 text-[10px] block mb-2">{pt.vehicleName} · {pt.distanceKm} km</span>
                            <div className="space-y-1 font-mono text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Actual:</span>
                                <span className="text-white font-bold">{pt.actualFuelLitres.toFixed(2)} L</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Predicted:</span>
                                <span className="text-emerald-400 font-bold">{pt.predictedFuelLitres.toFixed(2)} L</span>
                              </div>
                              <div className="flex justify-between border-t border-white/[0.08] pt-1">
                                <span className="text-slate-400">Error:</span>
                                <span className={Math.abs(pt.errorLitres) < 0.3 ? 'text-emerald-400' : 'text-amber-300'}>
                                  {pt.errorLitres > 0 ? `+${pt.errorLitres.toFixed(2)}` : pt.errorLitres.toFixed(2)} L ({pt.absPctError.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    segment={[{ x: 0, y: 0 }, { x: maxFuel, y: maxFuel }]}
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Scatter
                    name="Trips"
                    data={data.points}
                    fill="#34d399"
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Residuals Distribution Histogram */}
          {data.residualsHistogram && data.residualsHistogram.length > 0 && (
            <div className="visionos-window p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Residuals Error Distribution</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Distribution of prediction errors (Actual - Predicted). Gaussian bell distribution centered around 0L confirms un-biased regression.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/25">
                  Mean Error: {data.metrics.meanError.toFixed(2)} L
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.residualsHistogram} margin={{ top: 15, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={11}
                      label={{
                        value: 'Error Interval (Litres)',
                        position: 'insideBottom',
                        offset: -12,
                        fill: '#94a3b8',
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      label={{
                        value: 'Trip Count',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#94a3b8',
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const bin = payload[0].payload;
                          return (
                            <div className="visionos-window p-2.5 text-xs">
                              <span className="text-slate-400 block font-medium">Bin: {bin.label}</span>
                              <span className="font-mono text-emerald-400 font-bold mt-0.5 block">{bin.count} Trips</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
