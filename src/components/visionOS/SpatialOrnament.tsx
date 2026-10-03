import React from 'react';

interface SpatialOrnamentProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'inline';
  className?: string;
}

export function SpatialOrnament({
  children,
  position = 'inline',
  className = '',
}: SpatialOrnamentProps) {
  const positionClasses = {
    top: 'sticky top-6 z-40 mx-auto max-w-fit mb-8',
    bottom: 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
    inline: 'inline-flex',
  }[position];

  return (
    <div className={`visionos-ornament px-4 py-2 flex items-center gap-2 ${positionClasses} ${className}`}>
      {children}
    </div>
  );
}

interface SegmentedTabProps {
  options: { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SpatialSegmentedControl({
  options,
  activeId,
  onChange,
  className = '',
}: SegmentedTabProps) {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-white/[0.06] border border-white/[0.1] backdrop-blur-md ${className}`}
    >
      {options.map((option) => {
        const isActive = activeId === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-white/20 text-white shadow-sm shadow-black/20 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
