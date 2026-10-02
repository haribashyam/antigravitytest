'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  Database,
  ShieldCheck,
  BarChart3,
  Car,
  Filter,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
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

  const loadData = () => {
    setLoading(true);
    const query = selectedVehicleId ? `?vehicleId=${selectedVehicleId}` : '';
    fetch(`/api/validation${query}`)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedVehicleId]);

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
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2e45] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              EMPIRICAL VALIDATION
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Predicted vs Actual Model Accuracy
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Real data scatter analysis comparing actual pump-measured fuel against formula predictions.
          </p>
        </div>

        {vehicles.length > 0 && (
          <div className="w-full sm:w-64">
            <label className="block text-[11px] text-gray-400 mb-1">Filter by Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full rounded-lg border border-[#1f2e45] bg-[#111827] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Fleet Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading || !data ? (
        <div className="py-20 text-center font-mono text-xs text-gray-400">
          Calculating statistical correlation from stored trip records...
        </div>
      ) : data.tripsCount === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-[#1f2e45] p-12 text-center text-gray-400">
          No trip logs with actual fuel available for validation.{' '}
          <a href="/trips/new" className="text-emerald-400 underline">
            Log your first trip now.
          </a>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-center">
              <span className="text-xs text-gray-400 block">Overall R² Correlation</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                {data.metrics.rSquared.toFixed(3)}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                Closer to 1.0 = higher accuracy
              </span>
            </div>

            <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-center">
              <span className="text-xs text-gray-400 block">Mean Absolute Error (MAE)</span>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold text-cyan-300 font-mono">
                  {data.metrics.mae.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 font-mono">L</span>
              </div>
              <span className="text-[10px] text-gray-500 block">
                Avg deviation per trip
              </span>
            </div>

            <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-center">
              <span className="text-xs text-gray-400 block">Mean Abs Pct Error (MAPE)</span>
              <span className="text-3xl font-extrabold text-amber-300 font-mono">
                {data.metrics.mape.toFixed(1)}%
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                Average percentage error
              </span>
            </div>

            <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-center">
              <span className="text-xs text-gray-400 block">Validated Trips</span>
              <span className="text-3xl font-extrabold text-white font-mono">
                {data.tripsCount}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                Total real trips in dataset
              </span>
            </div>
          </div>

          {/* Scatter Plot: Predicted vs Actual */}
          <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2e45] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Predicted vs Actual Scatter Analysis
                </h3>
                <p className="text-xs text-gray-400">
                  Each dot represents one real trip. Points falling along the dashed 45° green line reflect high model precision.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start sm:self-auto">
                Diagonal = Perfect Fit (Y = X)
              </span>
            </div>

            <div className="mt-6 h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2e45" />
                  <XAxis
                    type="number"
                    dataKey="predictedFuelLitres"
                    name="Predicted Fuel"
                    unit=" L"
                    stroke="#9ca3af"
                    domain={[0, maxFuel]}
                    label={{
                      value: 'Predicted Fuel (Litres)',
                      position: 'insideBottom',
                      offset: -15,
                      fill: '#9ca3af',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="actualFuelLitres"
                    name="Actual Fuel"
                    unit=" L"
                    stroke="#9ca3af"
                    domain={[0, maxFuel]}
                    label={{
                      value: 'Actual Fuel (Litres)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#9ca3af',
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload as ScatterPoint;
                        return (
                          <div className="rounded-lg border border-[#1f2e45] bg-[#090d16] p-3 text-xs text-gray-200 shadow-xl font-mono">
                            <p className="font-bold text-white font-sans">{pt.tripName}</p>
                            <p className="text-[11px] text-gray-400">{pt.vehicleName} • {pt.date}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-cyan-300">
                                Actual Fuel: <strong>{pt.actualFuelLitres.toFixed(2)} L</strong>
                              </p>
                              <p className="text-emerald-400">
                                Predicted: <strong>{pt.predictedFuelLitres.toFixed(2)} L</strong>
                              </p>
                              <p className="text-amber-300">
                                Error: <strong>{pt.errorLitres > 0 ? `+${pt.errorLitres.toFixed(2)}` : pt.errorLitres.toFixed(2)} L ({pt.absPctError.toFixed(1)}%)</strong>
                              </p>
                              <p className="text-gray-400">Distance: {pt.distanceKm.toFixed(1)} km</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* 45-degree reference line */}
                  <ReferenceLine
                    segment={[
                      { x: 0, y: 0 },
                      { x: maxFuel, y: maxFuel },
                    ]}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                  />
                  <Scatter
                    name="Trip Logs"
                    data={data.points}
                    fill="#06b6d4"
                    fillOpacity={0.8}
                    stroke="#22d3ee"
                    strokeWidth={1}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Residuals Distribution Histogram */}
          {data.residualsHistogram && data.residualsHistogram.length > 0 && (
            <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white">Prediction Residuals Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Frequency count of error margins (Actual − Predicted in Litres). Centered around 0.0 indicates unbiased calibration.
              </p>

              <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.residualsHistogram}
                    margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2e45" />
                    <XAxis
                      dataKey="label"
                      stroke="#9ca3af"
                      fontSize={11}
                      label={{
                        value: 'Error Margin (Litres)',
                        position: 'insideBottom',
                        offset: -12,
                        fill: '#9ca3af',
                      }}
                    />
                    <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-[#1f2e45] bg-[#090d16] p-2 text-xs text-white font-mono">
                              <span>{item.label}: <strong>{item.count} trips</strong></span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
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
