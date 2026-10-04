import React from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="visionos-window p-8 shadow-2xl space-y-6">
        <div className="visionos-grab-bar mb-3" />
        <div className="border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <FileText className="h-4 w-4" />
            <span>LEGAL CONTRACT</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-zinc-950 dark:text-white font-nothing">Terms of Use</h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 font-mono">Effective Date: October 2026</p>
        </div>

        <section className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-white">1. Nature of the FuelWise Platform</h2>
          <p>
            FuelWise provides predictive vehicle fuel consumption and operating cost calculations.
            Predictions are computed using physical aerodynamics, rolling resistance, traffic, payload,
            and gradient equations fitted against user-submitted or sensor-logged driving data.
          </p>
          <p>
            While calculations are mathematically rigorous, road conditions, environmental factors
            (such as wind vectors, tire pressures, and ambient temperatures), and mechanical variances
            mean all predictions remain mathematical estimates. Drivers remain solely responsible for
            safe vehicle operation and maintaining adequate fuel reserves.
          </p>
        </section>

        <section className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-white">2. User Data and Driving Telemetry</h2>
          <p>
            When utilizing optional live tracking features, you authorize FuelWise to access device
            location (Geolocation API) and acceleration sensors (DeviceMotion API) strictly for trip
            distance, average speed, idle detection, and event counting.
          </p>
          <p>
            You retain 100% ownership of your recorded trip data. You may export or purge your data at
            any time via the Settings page.
          </p>
        </section>

        <section className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-white">3. Third-Party Routing and Data Feeds</h2>
          <p>
            FuelWise integrates public routing and elevation data providers including the Open Source
            Routing Machine (OSRM), OpenStreetMap, and Open-Elevation. While these services provide
            real-world network topology, availability is subject to public API uptime.
          </p>
        </section>
      </div>
    </div>
  );
}
