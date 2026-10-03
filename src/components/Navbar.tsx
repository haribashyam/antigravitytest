'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Fuel,
  Navigation,
  GitCompare,
  PlusCircle,
  History,
  Sliders,
  Car,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

interface UserData {
  id: string;
  name: string;
  email: string;
  currency: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const primaryLinks = [
    { href: '/plan', label: 'Plan Trip', icon: Navigation },
    { href: '/compare', label: 'Compare', icon: GitCompare },
    { href: '/trips/new', label: 'Log Trip', icon: PlusCircle },
    { href: '/trips', label: 'History', icon: History },
    { href: '/vehicles', label: 'Vehicles', icon: Car },
    { href: '/calibration', label: 'Calibration', icon: Sliders },
  ];

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6 w-full">
      {/* visionOS 2 Floating Pill Ornament */}
      <div className="visionos-ornament mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between transition-all">
        {/* Aesthetic Brand Logo Identity */}
        <BrandLogo size="md" href="/" />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm shadow-black/40 border border-red-500/40 text-red-200'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-red-400' : ''}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle with ⌘D shortcut */}
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-white/[0.08] border border-white/[0.12] px-3 py-1.5 text-xs">
                  <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-500/80 animate-pulse" />
                  <span className="font-medium text-white max-w-[110px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="visionos-pill-btn py-1.5 px-3 text-xs text-rose-300 hover:text-rose-200 hover:border-rose-400/30"
                  title="Sign Out"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="visionos-pill-btn text-xs px-3.5 py-1.5"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="visionos-pill-btn-primary text-xs px-4 py-1.5"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center pr-1">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer as a Floating visionOS Glass Window */}
      {mobileMenuOpen && (
        <div className="visionos-window mt-2 p-4 max-w-7xl mx-auto lg:hidden animate-fade-in-up">
          <div className="visionos-grab-bar mb-3" />
          <nav className="flex flex-col gap-1.5">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="mt-3 pt-3 border-t border-white/[0.1] flex flex-col gap-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-mono text-zinc-400">INTERFACE THEME</span>
                <ThemeToggle />
              </div>
              {user ? (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-300 py-1.5 px-3 rounded-xl bg-white/[0.04]">
                    <span className="font-semibold text-white">{user.name}</span>
                    <span className="text-slate-400">{user.email}</span>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 visionos-pill-btn text-center justify-center py-2"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 visionos-pill-btn-primary text-center justify-center py-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
