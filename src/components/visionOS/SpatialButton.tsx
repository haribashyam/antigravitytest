import React from 'react';

interface SpatialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

export function SpatialButton({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  ...props
}: SpatialButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs font-medium',
    lg: 'px-6 py-2.5 text-sm font-semibold',
  }[size];

  const variantClasses = {
    primary: 'visionos-pill-btn-primary',
    secondary: 'visionos-pill-btn',
    danger:
      'inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/12 text-rose-300 hover:bg-rose-500/22 hover:text-white backdrop-blur-md transition-all',
    ghost:
      'inline-flex items-center justify-center gap-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all',
  }[variant];

  return (
    <button
      className={`${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      <span>{children}</span>
    </button>
  );
}
