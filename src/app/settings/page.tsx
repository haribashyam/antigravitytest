'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings as SettingsIcon,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Save,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [unitSystem, setUnitSystem] = useState('metric');
  const [currency, setCurrency] = useState('INR');
  const [fuelPriceSource, setFuelPriceSource] = useState('manual');
  const [defaultFuelPrice, setDefaultFuelPrice] = useState(102.5);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setUnitSystem(data.settings.unitSystem || 'metric');
          setCurrency(data.settings.currency || 'INR');
          setFuelPriceSource(data.settings.fuelPriceSource || 'manual');
          setDefaultFuelPrice(data.settings.defaultFuelPrice || 102.5);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitSystem,
          currency,
          fuelPriceSource,
          defaultFuelPrice: Number(defaultFuelPrice),
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      setMessage('Preferences saved successfully!');
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    window.location.href = '/api/account/export';
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'WARNING: This will permanently delete your account, all vehicles, and all logged trips. This action cannot be undone. Are you sure?'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (res.ok) {
        alert('Account deleted successfully.');
        router.push('/');
        router.refresh();
      }
    } catch {
      alert('Failed to delete account');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* visionOS Window Header */}
      <div className="visionos-window p-6 sm:p-8 mb-8">
        <div className="visionos-grab-bar" />
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 border border-emerald-400/25 px-3 py-0.5 text-[11px] font-semibold text-emerald-300">
            <Sparkles className="h-3 w-3" />
            visionOS System Environment
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <SettingsIcon className="h-7 w-7 text-emerald-400" />
          Application & Regional Preferences
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Configure preferred physical units, active currency, fuel price feeds, and telemetry data export.
        </p>
      </div>

      {message && (
        <div
          className={`mb-8 visionos-window p-4 text-xs font-semibold ${
            isError
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-slate-400">
          Loading preferences...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Unit System Card */}
          <div className="visionos-window p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">Physical Measurement Units</h2>
            <p className="text-xs text-slate-400">
              Every physical quantity in FuelWise carries explicit units. Choose your regional standard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setUnitSystem('metric')}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  unitSystem === 'metric'
                    ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400/30'
                    : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Metric Standard</span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-400/30">
                    SI
                  </span>
                </div>
                <ul className="mt-3 text-xs text-slate-400 space-y-1 font-mono">
                  <li>• Distance: Kilometres (km)</li>
                  <li>• Fuel: Litres (L)</li>
                  <li>• Mileage: Kilometres per Litre (km/L)</li>
                  <li>• Speed: km/h</li>
                  <li>• Payload: Kilograms (kg)</li>
                </ul>
              </div>

              <div
                onClick={() => setUnitSystem('imperial')}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  unitSystem === 'imperial'
                    ? 'border-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-400/30'
                    : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Imperial Standard</span>
                  <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-400/30">
                    US / UK
                  </span>
                </div>
                <ul className="mt-3 text-xs text-slate-400 space-y-1 font-mono">
                  <li>• Distance: Miles (mi)</li>
                  <li>• Fuel: US Gallons (gal)</li>
                  <li>• Mileage: Miles per Gallon (MPG)</li>
                  <li>• Speed: mph</li>
                  <li>• Payload: Pounds (lbs)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Currency & Fuel Pricing Card */}
          <div className="visionos-window p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">Regional Currency & Default Fuel Pricing</h2>
            <p className="text-xs text-slate-400">
              All trip predictions calculate cost based on verified fuel prices or your self-reported regional rate.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full visionos-input text-xs cursor-pointer"
                >
                  <option value="INR" className="bg-[#0b101d] text-white">INR (₹) - Indian Rupee</option>
                  <option value="USD" className="bg-[#0b101d] text-white">USD ($) - US Dollar</option>
                  <option value="EUR" className="bg-[#0b101d] text-white">EUR (€) - Eurozone</option>
                  <option value="GBP" className="bg-[#0b101d] text-white">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Default Fuel Price per Litre
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={defaultFuelPrice}
                  onChange={(e) => setDefaultFuelPrice(Number(e.target.value))}
                  className="w-full visionos-input font-mono text-xs text-amber-300"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Self-reported local pump retail rate
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Pricing Strategy</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 cursor-pointer">
                  <input
                    type="radio"
                    name="priceSource"
                    checked={fuelPriceSource === 'manual'}
                    onChange={() => setFuelPriceSource('manual')}
                    className="accent-emerald-500"
                  />
                  <span className="text-xs text-slate-200">Self-Reported User Rate</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 cursor-pointer">
                  <input
                    type="radio"
                    name="priceSource"
                    checked={fuelPriceSource === 'live_feed'}
                    onChange={() => setFuelPriceSource('live_feed')}
                    className="accent-emerald-500"
                  />
                  <span className="text-xs text-slate-200">Live Petroleum Benchmark Feed</span>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Account Management */}
          <div className="visionos-window p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">Data Portability & Account Controls</h2>
            <p className="text-xs text-slate-400">
              Export your driving logs, telemetry points, and fitted coefficients as a clean machine-readable archive.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportData}
                className="visionos-pill-btn py-2.5 px-4 text-xs font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Export Complete Telemetry Archive (JSON)</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>Permanently Delete Account & Fleet</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="visionos-pill-btn-primary py-3 px-6 text-xs font-semibold disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving Preferences...' : 'Save All Preferences'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
