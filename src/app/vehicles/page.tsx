'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Plus,
  Sliders,
  Calendar,
  Fuel,
  Weight,
  Gauge,
  Trash2,
  Edit2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  X,
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

  // Form states
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

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setName('');
    setMake('');
    setModel('');
    setYear(2023);
    setFuelType('petrol');
    setM0(16.5);
    setRatedPayloadKg(450);
    setNotes('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setName(v.name);
    setMake(v.make);
    setModel(v.model);
    setYear(v.year);
    setFuelType(v.fuelType);
    setM0(v.m0);
    setRatedPayloadKg(v.ratedPayloadKg);
    setNotes(v.notes || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        name,
        make,
        model,
        year: Number(year),
        fuelType,
        m0: Number(m0),
        ratedPayloadKg: Number(ratedPayloadKg),
        notes: notes || undefined,
      };

      let res;
      if (editingVehicle) {
        res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save vehicle');
      }

      setModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? All associated trip logs and calibration history will be removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVehicles();
      }
    } catch (err) {
      console.error('Delete vehicle failed:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2e45] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              FLEET & TELEMETRY
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Vehicle Profiles & Calibrated Models
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Each vehicle maintains its own base mileage (M₀), rated payload, and personal OLS coefficient set.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {/* Vehicle Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono text-sm">
          Loading vehicle profiles and coefficients...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-[#1f2e45] p-12 text-center">
          <Car className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-base font-semibold text-white">No vehicles added yet</h3>
          <p className="mt-1 text-xs text-gray-400">
            Add your vehicle to begin logging trips and calibrating personal coefficients.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v) => {
            const coeffs = v.activeCoefficients;
            return (
              <div
                key={v.id}
                className="flex flex-col justify-between rounded-xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{v.name}</h3>
                        <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] font-mono text-gray-300 uppercase">
                          {v.fuelType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {v.year} {v.make} {v.model}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(v)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                        title="Edit Vehicle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.name)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calibration Status Badge */}
                  <div className="mt-3">
                    <ModelStatusBadge
                      isCalibrated={v.isCalibrated}
                      version={coeffs.version}
                      sampleSize={coeffs.sampleSize}
                      tripsCount={v.tripCount}
                    />
                  </div>

                  {/* Vehicle Spec Badges */}
                  <div className="mt-5 grid grid-cols-3 gap-3 border-y border-[#1f2e45] py-3 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Base Mileage (M₀)</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {v.m0} <span className="text-[10px] font-normal text-gray-400">km/L</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[11px]">Rated Payload</span>
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        {v.ratedPayloadKg} <span className="text-[10px] font-normal text-gray-400">kg</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[11px]">Stored Trips</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {v.tripCount}
                      </span>
                    </div>
                  </div>

                  {/* Fitted Coefficients Table */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      <span>Active Coefficients (v{coeffs.version})</span>
                      {coeffs.rSquared != null && (
                        <span className="text-emerald-400 font-mono">
                          Test R²: {coeffs.rSquared.toFixed(3)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#1f2e45] bg-[#090d16] p-3 text-[11px] font-mono">
                      <div>
                        <span className="text-gray-500 block">kᵥ (Speed²)</span>
                        <span className="text-gray-200">{coeffs.kv.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">kₜ (Traffic)</span>
                        <span className="text-gray-200">{coeffs.kt.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">kₗ (Load)</span>
                        <span className="text-gray-200">{coeffs.kl.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">kₐ (Aggressive)</span>
                        <span className="text-gray-200">{coeffs.ka.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">k_g (Gradient)</span>
                        <span className="text-gray-200">{coeffs.kg.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">kᵢ (Idle L/min)</span>
                        <span className="text-gray-200">{coeffs.ki.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Links */}
                <div className="mt-6 flex items-center justify-between border-t border-[#1f2e45] pt-4">
                  <Link
                    href={`/calibration?vehicleId=${v.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    Calibration Dashboard
                  </Link>

                  <Link
                    href={`/plan?vehicleId=${v.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Plan Trip with this Car
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f2e45] pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingVehicle ? 'Edit Vehicle Profile' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Vehicle Name (Display Name)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Daily Tata Nexon / Honda City"
                  className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Tata / Honda / Hyundai"
                    className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Nexon XZ+ / City ZX"
                    className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    min={1980}
                    max={2027}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="cng">CNG</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric (Equivalent L)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Base Mileage M₀ (km/L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={m0}
                    onChange={(e) => setM0(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500">Unloaded highway ideal mileage</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Rated Payload (kg)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="100"
                    required
                    value={ratedPayloadKg}
                    onChange={(e) => setRatedPayloadKg(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500">Passengers + cargo max rated</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Equipped with roof rack, all-terrain tires..."
                  className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1f2e45]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
