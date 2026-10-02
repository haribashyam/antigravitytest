import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'FuelWise — Intelligent Vehicle Fuel Consumption & Cost Prediction',
  description:
    'Mathematically grounded fuel consumption and cost prediction engine calibrated from your real driving data via Ordinary Least Squares regression.',
  keywords: [
    'fuel prediction',
    'mileage calculator',
    'trip cost predictor',
    'automotive telemetry',
    'fuel economy regression',
    'vehicle analytics',
  ],
  authors: [{ name: 'FuelWise Engineering Team' }],
  openGraph: {
    title: 'FuelWise — Production Fuel Consumption & Cost Prediction',
    description:
      'Predict fuel use and costs using a verified physics model calibrated against your real driving trips.',
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
      <body className="bg-[#090d16] text-[#f3f4f6] min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1">{children}</main>

        <footer className="border-t border-[#1f2e45] bg-[#070a11] py-8 text-xs text-gray-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-300">FuelWise Platform</span>
              <span>•</span>
              <span>Mathematically Grounded Automotive Analytics</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/terms" className="hover:text-gray-300 transition-colors">
                Terms of Use
              </a>
              <a href="/privacy" className="hover:text-gray-300 transition-colors">
                Privacy Policy
              </a>
              <a href="/validation" className="hover:text-gray-300 transition-colors">
                Model Accuracy
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                Data Provenance Docs
              </a>
            </div>
            <p className="text-[11px] text-gray-600">
              © {new Date().getFullYear()} FuelWise. All rights reserved. Zero fabricated data policy.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
