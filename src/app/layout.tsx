import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { MacOSMenuBar } from '@/components/widgets/MacOSMenuBar';

export const metadata: Metadata = {
  title: 'FuelWise — Know Your Real Fuel Costs Before You Drive',
  description:
    'FuelWise predicts exactly how much fuel and money your next trip will cost — based on real driving data, not guesswork.',
  keywords: [
    'fuel prediction',
    'mileage calculator',
    'trip cost predictor',
    'fuel economy',
    'vehicle analytics',
    'save fuel',
    'visionOS spatial design',
  ],
  authors: [{ name: 'FuelWise' }],
  openGraph: {
    title: 'FuelWise — Smart Fuel Cost Predictions',
    description:
      'Predict fuel use and costs using a model calibrated against your real driving trips.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060913] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500/25 selection:text-emerald-200 relative">
        {/* ═══════════ visionOS Spatial Environment Ambient Light Blooms ═══════════ */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {/* Top subtle aurora bloom */}
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-emerald-500/[0.12] via-teal-500/[0.06] to-transparent blur-[120px] rounded-full" />
          {/* Cyan side light */}
          <div className="absolute top-[25%] -left-[15%] w-[650px] h-[650px] bg-cyan-500/[0.06] blur-[140px] rounded-full" />
          {/* Deep indigo / purple spatial depth orb */}
          <div className="absolute top-[45%] -right-[15%] w-[700px] h-[700px] bg-indigo-500/[0.07] blur-[150px] rounded-full" />
          {/* Bottom subtle glow */}
          <div className="absolute -bottom-[20%] left-1/3 w-[850px] h-[550px] bg-emerald-500/[0.05] blur-[130px] rounded-full" />
          {/* Subtle noise/mesh overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        </div>

        {/* macOS 27 Desktop Status Menu Bar (with embedded Dynamic Island notch) */}
        <MacOSMenuBar />

        {/* Floating Navigation Ornament */}
        <div className="relative z-40 mt-1">
          <Navbar />
        </div>

        {/* Spatial Content Window */}
        <main className="relative z-10 flex-1">{children}</main>

        {/* visionOS Translucent Footer */}
        <footer className="relative z-10 mt-auto pt-16 pb-12 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="visionos-window px-6 py-8 sm:px-10 sm:py-10">
              <div className="visionos-grab-bar mb-6" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                {/* Brand */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/25">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="font-bold text-white text-sm tracking-tight">FuelWise</span>
                    <span className="text-[10px] font-medium text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      visionOS 2
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400 max-w-sm">
                    Automotive-grade fuel & cost predictions grounded in real physics and Ordinary Least Squares calibration.
                  </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-xs text-slate-400">
                  <a href="/plan" className="hover:text-white transition-colors">Plan Trip</a>
                  <a href="/compare" className="hover:text-white transition-colors">Compare</a>
                  <a href="/vehicles" className="hover:text-white transition-colors">Vehicles</a>
                  <a href="/calibration" className="hover:text-white transition-colors">Calibration</a>
                  <a href="/validation" className="hover:text-white transition-colors">Model Accuracy</a>
                  <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                  <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
                <span>© {new Date().getFullYear()} FuelWise. Mathematical & Physical Automotive Calibration.</span>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Spatial Experience Active
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
