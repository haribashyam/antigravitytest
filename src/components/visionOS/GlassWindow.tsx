import React from 'react';

interface GlassWindowProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  className?: string;
  showGrabBar?: boolean;
}

export function GlassWindow({
  children,
  title,
  subtitle,
  headerRight,
  className = '',
  showGrabBar = true,
}: GlassWindowProps) {
  return (
    <div className={`visionos-window p-6 sm:p-8 ${className}`}>
      {/* visionOS window top grab handle */}
      {showGrabBar && <div className="visionos-grab-bar" />}

      {/* Optional window header */}
      {(title || headerRight) && (
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]">
          <div>
            {title && <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
        </div>
      )}

      {children}
    </div>
  );
}

export function GlassPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`visionos-panel p-5 ${className}`}>
      {children}
    </div>
  );
}
