import React from 'react';

interface SpatialGaugeProps {
  value: number;
  min?: number;
  max?: number;
  unit: string;
  label: string;
  sublabel?: string;
  color?: 'emerald' | 'cyan' | 'amber' | 'purple';
  size?: number;
}

export function SpatialGauge({
  value,
  min = 0,
  max = 100,
  unit,
  label,
  sublabel,
  color = 'emerald',
  size = 130,
}: SpatialGaugeProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const strokeWidth = 9;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorStyles = {
    emerald: {
      gradientStart: '#34d399',
      gradientEnd: '#10b981',
      glow: 'rgba(52, 211, 153, 0.4)',
      text: 'text-emerald-400',
    },
    cyan: {
      gradientStart: '#22d3ee',
      gradientEnd: '#06b6d4',
      glow: 'rgba(34, 211, 238, 0.4)',
      text: 'text-cyan-400',
    },
    amber: {
      gradientStart: '#fbbf24',
      gradientEnd: '#f59e0b',
      glow: 'rgba(251, 191, 36, 0.4)',
      text: 'text-amber-400',
    },
    purple: {
      gradientStart: '#c084fc',
      gradientEnd: '#a855f7',
      glow: 'rgba(192, 132, 252, 0.4)',
      text: 'text-purple-400',
    },
  }[color];

  const gradientId = `spatial-gauge-grad-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorStyles.gradientStart} />
              <stop offset="100%" stopColor={colorStyles.gradientEnd} />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 0 6px ${colorStyles.glow})`,
            }}
          />
        </svg>

        {/* Center reading */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-bold tracking-tight text-white leading-none">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
            {unit}
          </span>
        </div>
      </div>

      <span className="text-xs font-semibold text-slate-200 mt-2">{label}</span>
      {sublabel && <span className="text-[10px] text-slate-500 mt-0.5">{sublabel}</span>}
    </div>
  );
}
