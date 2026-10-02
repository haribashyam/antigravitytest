import React from 'react';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-8 shadow-2xl space-y-6">
        <div className="border-b border-[#1f2e45] pb-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
            <Lock className="h-4 w-4" />
            <span>PRIVACY COMMITMENT</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="mt-1 text-xs text-gray-400">Effective Date: October 2026</p>
        </div>

        <section className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
          <p>
            FuelWise collects only the information necessary to calculate and calibrate vehicle fuel consumption models:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li>Account Information: Name, email address, password hash (encrypted via bcrypt).</li>
            <li>Vehicle Data: Make, model, year, fuel type, base ideal mileage (M₀), and rated payload.</li>
            <li>Trip Telemetry: Trip origin, destination, distance, average speed, traffic rating, payload ratio, road gradient, idle time, and pump-measured fuel used.</li>
            <li>Device Telemetry (When explicitly permitted during live drives): GPS coordinates (to compute distance) and accelerometer readings (to count harsh braking events).</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-white">2. How Telemetry is Used</h2>
          <p>
            Trip logs are used strictly by our Ordinary Least Squares regression algorithm to fit your personal vehicle coefficients (kv, kt, kl, ka, kg, ki). We do NOT sell, license, or broker your driving telemetry to automotive insurance companies, brokers, or advertising networks.
          </p>
        </section>

        <section className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-white">3. Data Export & Right to Deletion (GDPR / CCPA)</h2>
          <p>
            You have the absolute right to export your complete trip history as an open JSON archive or CSV spreadsheet. You may also execute an irreversible deletion of your account and all associated logs from our database at any time via the Settings page.
          </p>
        </section>
      </div>
    </div>
  );
}
