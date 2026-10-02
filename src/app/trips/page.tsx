'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Download,
  Search,
  Filter,
  Car,
  Fuel,
  TrendingDown,
  TrendingUp,
  PlusCircle,
  Calendar,
  Layers,
} from 'lucide-react';
import { DataSourceBadge } from '@/components/Badges';

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
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch(console.error);
  }, []);

  const fetchTrips = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedVehicleId) query.set('vehicleId', selectedVehicleId);
    if (search) query.set('search', search);

    fetch(`/api/trips?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => setTrips(data.trips || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrips();
  }, [selectedVehicleId, search]);

  const handleExportCsv = () => {
    const query = selectedVehicleId ? `?vehicleId=${selectedVehicleId}` : '';
    window.location.href = `/api/trips/export${query}`;
  };

  // Aggregate stats
  const totalDistance = trips.reduce((sum, t) => sum + t.distanceKm, 0);
  const totalFuel = trips.reduce((sum, t) => sum + t.fuelUsedLitres, 0);
  const totalCost = trips.reduce((sum, t) => sum + t.actualCost, 0);
  const avgMileage = totalFuel > 0 ? totalDistance / totalFuel : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2e45] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              PERSISTENT DATABASE LOGS
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Historical Trip Ledger
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Real trip records with actual vs predicted fuel use, telemetry parameters, and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            disabled={trips.length === 0}
            className="flex items-center gap-2 rounded-lg border border-[#1f2e45] bg-[#111827] px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-[#1a2333] hover:text-white transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <Link
            href="/trips/new"
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Log Trip
          </Link>
        </div>
      </div>

      {/* Aggregate Stats Summary Cards */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
          <span className="text-xs text-gray-400">Total Trips Logged</span>
          <span className="mt-1 block text-2xl font-bold text-white font-mono">
            {trips.length}
          </span>
        </div>

        <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
          <span className="text-xs text-gray-400">Total Distance</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {totalDistance.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400 font-mono">km</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
          <span className="text-xs text-gray-400">Actual Fuel Burned</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-cyan-300 font-mono">
              {totalFuel.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400 font-mono">L</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
          <span className="text-xs text-gray-400">Average Real Mileage</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-300 font-mono">
              {avgMileage.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400 font-mono">km/L</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by trip name, origin, or destination..."
            className="w-full rounded-lg border border-[#1f2e45] bg-[#111827] py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {vehicles.length > 0 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full rounded-lg border border-[#1f2e45] bg-[#111827] py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Trips Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#1f2e45] bg-[#111827] shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-gray-400">
            Querying trip logs from database...
          </div>
        ) : trips.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            No matching trips found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#1f2e45] bg-[#090d16] font-mono text-gray-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Trip Route / Name</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Distance (km)</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4">Actual (L)</th>
                  <th className="py-3 px-4">Predicted (L)</th>
                  <th className="py-3 px-4">Delta Error</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2e45] text-gray-300 font-mono">
                {trips.map((t) => {
                  const error =
                    t.predictedFuelLitres != null
                      ? t.fuelUsedLitres - t.predictedFuelLitres
                      : null;
                  const pctError =
                    error != null && t.fuelUsedLitres > 0
                      ? (Math.abs(error) / t.fuelUsedLitres) * 100
                      : null;

                  return (
                    <tr key={t.id} className="hover:bg-[#162032] transition-colors">
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-white max-w-[200px] truncate">
                        {t.tripName}
                      </td>
                      <td className="py-3 px-4 font-sans text-gray-300 whitespace-nowrap">
                        {t.vehicle?.name}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {t.distanceKm.toFixed(1)} km
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {t.avgSpeedKmh.toFixed(0)} km/h
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {t.fuelUsedLitres.toFixed(2)} L
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {t.predictedFuelLitres != null
                          ? `${t.predictedFuelLitres.toFixed(2)} L`
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {error != null ? (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              Math.abs(error) < 0.25 ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {error > 0 ? `+${error.toFixed(2)}` : error.toFixed(2)} L
                            <span className="text-[10px] text-gray-500">
                              ({pctError?.toFixed(1)}%)
                            </span>
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400 whitespace-nowrap">
                        ₹{t.actualCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
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
