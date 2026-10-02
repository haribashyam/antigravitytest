import React from 'react';
import { ShieldCheck, Info, AlertTriangle, CheckCircle, Database, Cpu } from 'lucide-react';

interface DataSourceBadgeProps {
  source: string;
  className?: string;
}

export function DataSourceBadge({ source, className = '' }: DataSourceBadgeProps) {
  let label = source;
  let bg = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  let icon = <Database className="h-3 w-3" />;

  switch (source) {
    case 'osrm_live':
      label = 'OSRM Live Routing Engine';
      bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      icon = <CheckCircle className="h-3 w-3" />;
      break;
    case 'manual_estimate':
    case 'manual':
      label = 'Manual User Entry';
      bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      icon = <Info className="h-3 w-3" />;
      break;
    case 'gps_live':
      label = 'HTML5 Geolocation Telemetry';
      bg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      icon = <Cpu className="h-3 w-3" />;
      break;
    case 'open_elevation_api':
      label = 'Open-Elevation Live Sampled';
      bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      icon = <CheckCircle className="h-3 w-3" />;
      break;
    case 'omitted_not_available':
      label = 'Gradient Not Available (Omitted)';
      bg = 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      icon = <AlertTriangle className="h-3 w-3" />;
      break;
    case 'self_reported':
      label = 'Self-Reported Fuel Price';
      bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      icon = <Info className="h-3 w-3" />;
      break;
    case 'live_feed':
      label = 'Public Benchmark Daily Feed';
      bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      icon = <CheckCircle className="h-3 w-3" />;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium tracking-wide ${bg} ${className}`}
      title={`Data provenance: ${label}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}

interface ModelStatusBadgeProps {
  isCalibrated: boolean;
  version?: number;
  sampleSize?: number;
  tripsCount?: number;
  className?: string;
}

export function ModelStatusBadge({
  isCalibrated,
  version = 1,
  sampleSize = 0,
  tripsCount = 0,
  className = '',
}: ModelStatusBadgeProps) {
  if (isCalibrated) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 ${className}`}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>Personal OLS Model (v{version} from {sampleSize} trips)</span>
      </span>
    );
  }

  const needed = Math.max(0, 8 - (tripsCount || sampleSize));

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 ${className}`}
      title="Engineering population baseline used until 8 personal trips are logged"
    >
      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
      <span>Population Baseline (Need {needed} more {needed === 1 ? 'trip' : 'trips'} to calibrate)</span>
    </span>
  );
}
