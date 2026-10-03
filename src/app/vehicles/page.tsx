'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Plus,
  Sliders,
  Trash2,
  Edit2,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { ModelStatusBadge } from '@/components/Badges';

interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  m0: number;
  ratedPayloadKg: number;
  notes?: string;
  tripCount: number;
  isCalibrated: boolean;
  activeCoefficients: {
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
  };
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2023);
  const [fuelType, setFuelType] = useState('petrol');
  const [m0, setM0] = useState(16.5);
  const [ratedPayloadKg, setRatedPayloadKg] = useState(450);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setName(''); setMake(''); setModel(''); setYear(2023);
    setFuelType('petrol'); setM0(16.5); setRatedPayloadKg(450); setNotes('');
    setFormError(''); setModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setName(v.name); setMake(v.make); setModel(v.model); setYear(v.year);
    setFuelType(v.fuelType); setM0(v.m0); setRatedPayloadKg(v.ratedPayloadKg);
    setNotes(v.notes || ''); setFormError(''); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        name, make, model, year: Number(year), fuelType,
        m0: Number(m0), ratedPayloadKg: Number(ratedPayloadKg),
        notes: notes || undefined,
      };

      let res;
      if (editingVehicle) {
        res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/vehicles', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save vehicle');
      setModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? All trip logs and calibrations will be removed.`)) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) fetchVehicles();
    } catch (err) {
      console.error('Delete vehicle failed:', err);
    }
  };

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
                visionOS Fleet Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Car className="h-7 w-7 text-emerald-400" />
              Registered Vehicles
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Manage vehicle hardware parameters and inspect Ordinary Least Squares regression calibration status.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="visionos-pill-btn-primary py-2.5 px-4 text-xs font-semibold self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-mono">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="visionos-window p-16 text-center">
          <Car className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-base font-semibold text-white">No vehicles yet</h3>
          <p className="mt-1.5 text-xs text-slate-400">
            Add your first vehicle to start logging trips and getting predictions.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 visionos-pill-btn-primary py-2.5 px-5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v) => {
            const coeffs = v.activeCoefficients;
            return (
              <div
                key={v.id}
                className="visionos-window flex flex-col justify-between p-6 sm:p-7"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold text-white tracking-tight">{v.name}</h3>
                        <span className="rounded-full bg-white/[0.08] border border-white/[0.12] px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                          {v.fuelType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {v.year} {v.make} {v.model}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(v)}
                        className="rounded-full p-2 text-slate-400 hover:bg-white/[0.1] hover:text-white transition-all"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.name)}
                        className="rounded-full p-2 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <ModelStatusBadge
                      isCalibrated={v.isCalibrated}
                      version={coeffs.version}
                      sampleSize={coeffs.sampleSize}
                      tripsCount={v.tripCount}
                    />
                  </div>

                  {/* Vehicle Specs in visionOS Panel */}
                  <div className="mt-5 grid grid-cols-3 gap-3 visionos-panel p-3.5 text-xs text-center">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Base Mileage</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                        {v.m0} <span className="text-[10px] font-normal text-slate-500">km/L</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Max Payload</span>
                      <span className="font-mono font-bold text-cyan-300 text-sm mt-0.5 block">
                        {v.ratedPayloadKg} <span className="text-[10px] font-normal text-slate-500">kg</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Logged Trips</span>
                      <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">
                        {v.tripCount}
                      </span>
                    </div>
                  </div>

                  {/* Coefficients Preview */}
                  <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px]">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="font-medium text-slate-300">Active Coefficients (v{coeffs.version})</span>
                      <span className="font-mono text-[10px]">
                        {coeffs.isDefault ? 'Default Baseline' : `OLS Fitted (N=${coeffs.sampleSize})`}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                      <div className="visionos-panel py-1.5 px-1">
                        <span className="text-slate-500 text-[9px] block">kv</span>
                        <span className="text-slate-200 text-xs font-semibold">{coeffs.kv.toExponential(1)}</span>
                      </div>
                      <div className="visionos-panel py-1.5 px-1">
                        <span className="text-slate-500 text-[9px] block">kt</span>
                        <span className="text-slate-200 text-xs font-semibold">{coeffs.kt.toFixed(2)}</span>
                      </div>
                      <div className="visionos-panel py-1.5 px-1">
                        <span className="text-slate-500 text-[9px] block">kl</span>
                        <span className="text-slate-200 text-xs font-semibold">{coeffs.kl.toFixed(2)}</span>
                      </div>
                      <div className="visionos-panel py-1.5 px-1">
                        <span className="text-slate-500 text-[9px] block">ka</span>
                        <span className="text-slate-200 text-xs font-semibold">{coeffs.ka.toFixed(2)}</span>
                      </div>
                      <div className="visionos-panel py-1.5 px-1">
                        <span className="text-slate-500 text-[9px] block">kg</span>
                        <span className="text-slate-200 text-xs font-semibold">{coeffs.kg.toFixed(1)}</span>
                      </div>
                      <div className="visionos-panel py-1.5 px-1">
                        <span className="text-slate-500 text-[9px] block">ki</span>
                        <span className="text-slate-200 text-xs font-semibold">{coeffs.ki.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  <Link
                    href={`/calibration?vehicleId=${v.id}`}
                    className="visionos-pill-btn text-xs py-2 px-3.5"
                  >
                    <Sliders className="h-3.5 w-3.5 text-purple-400" />
                    <span>View Model & Fit</span>
                  </Link>

                  <Link
                    href={`/plan?vehicleId=${v.id}`}
                    className="visionos-pill-btn-primary text-xs py-2 px-3.5"
                  >
                    <span>Plan Journey</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* visionOS Modal Window */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
          <div className="visionos-window w-full max-w-lg p-6 sm:p-8 animate-fade-in-up bg-[#141b2d]/90 shadow-2xl">
            <div className="visionos-grab-bar mb-3" />
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <h2 className="text-lg font-bold text-white">
                {editingVehicle ? 'Edit Vehicle Specifications' : 'Register New Vehicle'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-white/[0.1] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nickname</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Commuter Swift"
                  className="w-full visionos-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Make</label>
                  <input
                    type="text" required value={make} onChange={(e) => setMake(e.target.value)}
                    placeholder="Maruti Suzuki"
                    className="w-full visionos-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Model</label>
                  <input
                    type="text" required value={model} onChange={(e) => setModel(e.target.value)}
                    placeholder="Swift VXi"
                    className="w-full visionos-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Model Year</label>
                  <input
                    type="number" required min="1990" max="2027" value={year} onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full visionos-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fuel Grade</label>
                  <select
                    value={fuelType} onChange={(e) => setFuelType(e.target.value)}
                    className="w-full visionos-input text-xs cursor-pointer"
                  >
                    <option value="petrol" className="bg-[#0b101d] text-white">Petrol</option>
                    <option value="diesel" className="bg-[#0b101d] text-white">Diesel</option>
                    <option value="cng" className="bg-[#0b101d] text-white">CNG</option>
                    <option value="hybrid" className="bg-[#0b101d] text-white">Strong Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Rated Mileage M₀ (km/L)
                  </label>
                  <input
                    type="number" step="0.1" required min="5" max="45" value={m0} onChange={(e) => setM0(Number(e.target.value))}
                    className="w-full visionos-input text-xs font-mono text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Max Payload (kg)
                  </label>
                  <input
                    type="number" required min="100" max="2000" value={ratedPayloadKg} onChange={(e) => setRatedPayloadKg(Number(e.target.value))}
                    className="w-full visionos-input text-xs font-mono text-cyan-300"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  className="visionos-pill-btn text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="visionos-pill-btn-primary text-xs py-2 px-5 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingVehicle ? 'Update Specifications' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
