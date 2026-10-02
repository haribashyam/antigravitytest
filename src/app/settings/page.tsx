'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings as SettingsIcon,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Save,
  DollarSign,
  Gauge,
  Database,
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
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="border-b border-[#1f2e45] pb-6">
        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
            SYSTEM PREFERENCES
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
          Application & Regional Settings
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Configure preferred physical units, active currency, fuel price feeds, and data export.
        </p>
      </div>

      {message && (
        <div
          className={`mt-6 rounded-xl border p-4 text-xs font-semibold ${
            isError
              ? 'border-red-500/40 bg-red-500/10 text-red-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {/* Unit System Card */}
        <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Physical Measurement Units</h2>
          <p className="text-xs text-gray-400">
            Every physical quantity in FuelWise carries explicit units. Choose your regional standard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setUnitSystem('metric')}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                unitSystem === 'metric'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-[#1f2e45] bg-[#090d16] hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Metric Standard</span>
                <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  SI
                </span>
              </div>
              <ul className="mt-2 text-xs text-gray-400 space-y-1 font-mono">
                <li>• Distance: Kilometres (km)</li>
                <li>• Fuel: Litres (L)</li>
                <li>• Mileage: Kilometres per Litre (km/L)</li>
                <li>• Speed: km/h</li>
                <li>• Payload: Kilograms (kg)</li>
              </ul>
            </div>

            <div
              onClick={() => setUnitSystem('imperial')}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                unitSystem === 'imperial'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-[#1f2e45] bg-[#090d16] hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Imperial Standard</span>
                <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
                  US / UK
                </span>
              </div>
              <ul className="mt-2 text-xs text-gray-400 space-y-1 font-mono">
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
        <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Regional Currency & Default Fuel Pricing</h2>
          <p className="text-xs text-gray-400">
            All trip predictions calculate cost based on verified fuel prices or your self-reported regional rate.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Eurozone</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Default Fuel Price per Litre
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={defaultFuelPrice}
                onChange={(e) => setDefaultFuelPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1f2e45] bg-[#090d16] px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-gray-500">
                Self-reported local pump retail rate
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Pricing Strategy</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-[#1f2e45] bg-[#090d16] p-3 cursor-pointer">
                <input
                  type="radio"
                  name="priceSource"
                  checked={fuelPriceSource === 'manual'}
                  onChange={() => setFuelPriceSource('manual')}
                  className="accent-emerald-500"
                />
                <span className="text-xs text-gray-200">Self-Reported User Rate</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-[#1f2e45] bg-[#090d16] p-3 cursor-pointer">
                <input
                  type="radio"
                  name="priceSource"
                  checked={fuelPriceSource === 'api'}
                  onChange={() => setFuelPriceSource('api')}
                  className="accent-emerald-500"
                />
                <span className="text-xs text-gray-200">Public Retail Benchmark Feed</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {/* Account Data Privacy & Export (GDPR Compliance) */}
      <div className="mt-12 rounded-2xl border border-red-500/20 bg-[#111827] p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-base font-bold text-white">Data Privacy & Account Controls</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            FuelWise stores your vehicle profiles and trip logs in persistent SQL storage. You have full ownership of your data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1f2e45] pt-4">
          <div>
            <span className="text-xs font-semibold text-white block">
              Export Complete Account Archive (JSON)
            </span>
            <span className="text-[11px] text-gray-500">
              Download all vehicles, trip logs, fitted coefficients, and telemetry records.
            </span>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 rounded-lg border border-[#1f2e45] bg-[#090d16] px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-gray-800 transition-all"
          >
            <Download className="h-4 w-4" />
            Export Archive
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1f2e45] pt-4">
          <div>
            <span className="text-xs font-semibold text-red-400 block">
              Delete Account & Permanent Data Wipe
            </span>
            <span className="text-[11px] text-gray-500">
              Irreversibly remove all user data, vehicle profiles, and trip history.
            </span>
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
