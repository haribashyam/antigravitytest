import React from 'react';
import { ShieldCheck, Info, AlertTriangle, CheckCircle, Database, Cpu } from 'lucide-react';

interface DataSourceBadgeProps {
  source: string;
  className?: string;
}

export function DataSourceBadge({ source, className = '' }: DataSourceBadgeProps) {
  let label = source;
  let bg = 'bg-blue-500/10 text-blue-300 border-blue-400/25';
  let icon = <Database className="h-3 w-3" />;

  switch (source) {
    case 'osrm_live':
      label = 'Live Route';
      bg = 'bg-emerald-500/10 text-emerald-300 border-emerald-400/25 shadow-emerald-500/10';
      icon = <CheckCircle className="h-3 w-3 text-emerald-400" />;
      break;
    case 'manual_estimate':
    case 'manual':
      label = 'Manual';
      bg = 'bg-amber-500/10 text-amber-300 border-amber-400/25';
      icon = <Info className="h-3 w-3 text-amber-400" />;
      break;
    case 'gps_live':
      label = 'GPS Tracked';
      bg = 'bg-cyan-500/10 text-cyan-300 border-cyan-400/25 shadow-cyan-500/10';
      icon = <Cpu className="h-3 w-3 text-cyan-400" />;
      break;
    case 'open_elevation_api':
      label = 'Elevation API';
      bg = 'bg-emerald-500/10 text-emerald-300 border-emerald-400/25';
      icon = <CheckCircle className="h-3 w-3 text-emerald-400" />;
      break;
    case 'omitted_not_available':
      label = 'Not Available';
      bg = 'bg-slate-500/10 text-slate-400 border-slate-400/20';
      icon = <AlertTriangle className="h-3 w-3 text-slate-400" />;
      break;
    case 'self_reported':
      label = 'Self-Reported';
      bg = 'bg-amber-500/10 text-amber-300 border-amber-400/25';
      icon = <Info className="h-3 w-3 text-amber-400" />;
      break;
    case 'live_feed':
      label = 'Live Price';
      bg = 'bg-emerald-500/10 text-emerald-300 border-emerald-400/25';
      icon = <CheckCircle className="h-3 w-3 text-emerald-400" />;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md shadow-sm ${bg} ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0.5px rgba(255, 255, 255, 0.25)',
      }}
      title={`Source: ${label}`}
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
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md shadow-sm shadow-emerald-500/10 ${className}`}
        style={{
          boxShadow: 'inset 0 1px 0.5px rgba(255, 255, 255, 0.3)',
        }}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>Calibrated (v{version} · {sampleSize} trips)</span>
      </span>
    );
  }

  const needed = Math.max(0, 8 - (tripsCount || sampleSize));

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/12 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-md shadow-sm ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0.5px rgba(255, 255, 255, 0.25)',
      }}
      title="Default model used until 8 trips are logged"
    >
      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
      <span>Needs {needed} more {needed === 1 ? 'trip' : 'trips'} to calibrate</span>
    </span>
  );
}
