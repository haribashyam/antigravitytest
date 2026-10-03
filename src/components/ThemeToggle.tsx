'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'dark' | 'light';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (newTheme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
      }
      localStorage.setItem('fuelwise-theme', newTheme);
      window.dispatchEvent(
        new CustomEvent('fuelwise-theme-change', { detail: { theme: newTheme } })
      );
    }
  }, []);

  // Initialize from storage or system preference
  useEffect(() => {
    const saved = localStorage.getItem('fuelwise-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }
  }, [applyTheme]);

  // Toggle function with Toast
  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setToastMessage(next === 'light' ? '☀️ Light Mode Activated (⌘D)' : '🌙 Dark Mode Activated (⌘D)');
    const timer = setTimeout(() => setToastMessage(null), 1800);
    return () => clearTimeout(timer);
  }, [theme, applyTheme]);

  // Keyboard shortcut: Cmd+D / Ctrl+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in form inputs
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check for Cmd+D (Mac) or Ctrl+D (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return (
    <>
      {/* Sleek Nothing OS Tactile Theme Switcher Button */}
      <button
        type="button"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode (Shortcut: ⌘D)`}
        aria-label="Toggle theme mode"
        className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl hover:border-red-500/50 hover:bg-white/[0.08] transition-all cursor-pointer shadow-sm ${className}`}
      >
        <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.08] border border-white/10 group-hover:scale-110 transition-transform">
          {theme === 'dark' ? (
            <Moon className="w-3 h-3 text-red-400 group-hover:text-red-300 transition-colors" />
          ) : (
            <Sun className="w-3 h-3 text-amber-400 group-hover:text-amber-300 transition-colors" />
          )}
        </div>

        <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-semibold group-hover:text-white">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>

        {/* Keyboard Shortcut Badge */}
        <span className="hidden md:inline text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
          ⌘D
        </span>
      </button>

      {/* Floating HUD Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/90 border border-red-500/40 text-xs font-mono text-white shadow-2xl backdrop-blur-2xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default ThemeToggle;
