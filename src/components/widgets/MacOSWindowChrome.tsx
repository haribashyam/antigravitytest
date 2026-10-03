'use client';

import React from 'react';

interface MacOSWindowChromeProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onZoom?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const MacOSWindowChrome: React.FC<MacOSWindowChromeProps> = ({
  title,
  subtitle,
  onClose,
  onMinimize,
  onZoom,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`macos-window-header flex items-center justify-between border-b border-white/[0.08] select-none ${className}`}
    >
      {/* Left: macOS Traffic Lights */}
      <div className="flex items-center gap-2 group/lights">
        <button
          type="button"
          onClick={onClose}
          className="macos-traffic-light macos-traffic-light-close flex items-center justify-center text-[8px] text-red-950 font-bold opacity-90 group-hover/lights:opacity-100"
          title="Close window"
        >
          <span className="opacity-0 group-hover/lights:opacity-100">✕</span>
        </button>
        <button
          type="button"
          onClick={onMinimize}
          className="macos-traffic-light macos-traffic-light-minimize flex items-center justify-center text-[8px] text-amber-950 font-bold opacity-90 group-hover/lights:opacity-100"
          title="Minimize window"
        >
          <span className="opacity-0 group-hover/lights:opacity-100">−</span>
        </button>
        <button
          type="button"
          onClick={onZoom}
          className="macos-traffic-light macos-traffic-light-zoom flex items-center justify-center text-[8px] text-green-950 font-bold opacity-90 group-hover/lights:opacity-100"
          title="Expand window"
        >
          <span className="opacity-0 group-hover/lights:opacity-100">+</span>
        </button>
      </div>

      {/* Center: Window Title */}
      <div className="flex items-center gap-2 text-center pointer-events-none">
        <span className="text-xs font-semibold text-slate-200 tracking-tight">
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px] font-mono text-slate-400 border-l border-white/10 pl-2">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Actions / Status */}
      <div className="flex items-center gap-2 text-xs">
        {actions || (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE</span>
          </div>
        )}
      </div>
    </div>
  );
};
