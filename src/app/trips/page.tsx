'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Download,
  Search,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { DataSourceBadge } from '@/components/Badges';
import { authFetch } from '@/lib/apiClient';

interface TripLog {
  id: string;
  tripName: string;
  origin?: string;
  destination?: string;
  distanceKm: number;
  fuelUsedLitres: number;
  predictedFuelLitres?: number | null;
  avgSpeedKmh: number;
  trafficIntensity: number;
  loadRatio: number;
  hardAccelEvents: number;
  hardBrakeEvents: number;
  gradientDecimal: number;
  idleMinutes: number;
  fuelPricePerLitre: number;
  actualCost: number;
  predictedCost?: number | null;
  dataSource: string;
  date: string;
  vehicle: {
    id: string;
    name: string;
    make: string;
    model: string;
    m0: number;
  };
}

export default function TripHistoryPage() {
  const [trips, setTrips] = useState<TripLog[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch(console.error);
  }, []);

  const fetchTrips = React.useCallback(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedVehicleId) query.set('vehicleId', selectedVehicleId);
    if (search) query.set('search', search);

    authFetch(`/api/trips?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => setTrips(data.trips || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedVehicleId, search]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleExportCsv = () => {
    const query = selectedVehicleId ? `?vehicleId=${selectedVehicleId}` : '';
    window.location.href = `/api/trips/export${query}`;
  };

  const totalDistance = trips.reduce((sum, t) => sum + t.distanceKm, 0);
  const totalFuel = trips.reduce((sum, t) => sum + t.fuelUsedLitres, 0);
  const avgMileage = totalFuel > 0 ? totalDistance / totalFuel : 0;

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
                visionOS Telemetry Logs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <History className="h-7 w-7 text-emerald-400" />
              Journey History & Ingestion Log
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Audit recorded journeys against model predictions to evaluate accuracy residuals and regression convergence.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleExportCsv}
              disabled={trips.length === 0}
              className="visionos-pill-btn py-2 px-3.5 text-xs font-medium disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/trips/new"
              className="visionos-pill-btn-primary py-2 px-4 text-xs font-semibold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Log Trip</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary in visionOS Panels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Trips" value={trips.length.toString()} />
        <StatCard label="Distance Covered" value={`${totalDistance.toFixed(0)} km`} accent="emerald" />
        <StatCard label="Fuel Used" value={`${totalFuel.toFixed(1)} L`} accent="cyan" />
        <StatCard label="Avg. Mileage" value={`${avgMileage.toFixed(1)} km/L`} accent="amber" />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips by name or location..."
            className="w-full visionos-input pl-10 text-xs"
          />
        </div>

        {vehicles.length > 0 && (
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full sm:w-60 visionos-input text-xs cursor-pointer"
          >
            <option value="" className="bg-[#0b101d] text-white">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id} className="bg-[#0b101d] text-white">{v.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Trips Table in visionOS Window Frame */}
      <div className="visionos-window overflow-hidden p-0 shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-mono">Loading trips telemetry...</div>
        ) : trips.length === 0 ? (
          <div className="py-20 text-center p-6">
            <History className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-xs text-slate-400">No journeys logged yet. Record your first trip to initiate calibration.</p>
            <Link href="/trips/new" className="mt-4 inline-flex items-center gap-2 visionos-pill-btn-primary py-2 px-4 text-xs font-semibold">
              <PlusCircle className="h-3.5 w-3.5" /> Log First Journey
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.03] text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4 font-semibold">Date</th>
                  <th className="py-4 px-4 font-semibold">Trip</th>
                  <th className="py-4 px-4 font-semibold">Vehicle</th>
                  <th className="py-4 px-4 font-semibold">Distance</th>
                  <th className="py-4 px-4 font-semibold">Speed</th>
                  <th className="py-4 px-4 font-semibold">Actual</th>
                  <th className="py-4 px-4 font-semibold">Predicted</th>
                  <th className="py-4 px-4 font-semibold">Residual Error</th>
                  <th className="py-4 px-4 font-semibold">Expense</th>
                  <th className="py-4 px-4 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {trips.map((t) => {
                  const error = t.predictedFuelLitres != null ? t.fuelUsedLitres - t.predictedFuelLitres : null;
                  const pctError = error != null && t.fuelUsedLitres > 0 ? (Math.abs(error) / t.fuelUsedLitres) * 100 : null;

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white max-w-[180px] truncate">
                        {t.tripName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {t.vehicle?.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                        {t.distanceKm.toFixed(1)} km
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {t.avgSpeedKmh.toFixed(0)} km/h
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        {t.fuelUsedLitres.toFixed(2)} L
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {t.predictedFuelLitres != null ? `${t.predictedFuelLitres.toFixed(2)} L` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {error != null ? (
                          <span className={`inline-flex items-center gap-1 font-mono font-semibold ${Math.abs(error) < 0.25 ? 'text-emerald-400' : 'text-amber-300'}`}>
                            {error > 0 ? `+${error.toFixed(2)}` : error.toFixed(2)} L
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({pctError?.toFixed(1)}%)
                            </span>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-400 whitespace-nowrap">
                        ₹{t.actualCost.toFixed(0)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <DataSourceBadge source={t.dataSource} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400 glow-green',
    cyan: 'text-cyan-300 glow-cyan',
    amber: 'text-amber-300',
  };
  return (
    <div className="visionos-panel p-4">
      <span className="text-[11px] text-slate-400 font-medium block">{label}</span>
      <span className={`mt-1 block text-2xl font-bold font-mono ${accent ? colors[accent] : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
