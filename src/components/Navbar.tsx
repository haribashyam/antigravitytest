'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Gauge,
  Navigation,
  GitCompare,
  PlusCircle,
  History,
  Sliders,
  CheckCircle2,
  Settings as SettingsIcon,
  LogOut,
  Car,
  User as UserIcon,
  Menu,
  X,
  Activity,
} from 'lucide-react';

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

  const navLinks = [
    { href: '/plan', label: 'Plan Trip', icon: Navigation },
    { href: '/compare', label: 'What-If Compare', icon: GitCompare },
    { href: '/trips/new', label: 'Log Trip', icon: PlusCircle },
    { href: '/trips', label: 'History', icon: History },
    { href: '/calibration', label: 'Calibration', icon: Sliders },
    { href: '/validation', label: 'Validation', icon: CheckCircle2 },
    { href: '/vehicles', label: 'Vehicles', icon: Car },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#1f2e45] bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
            <Gauge className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-lg">FuelWise</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-400 border border-emerald-500/30">
                PROD
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider hidden sm:block">
              PRECISION CONSUMPTION ENGINE
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* User Session Info & Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#1f2e45] bg-[#111827] px-3 py-1 text-xs text-gray-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-medium text-white max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">({user.currency})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-md border border-gray-700/60 bg-gray-800/40 px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
              >
                Log In
              </a>
              <a
                href="/signup"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
              >
                Get Started
              </a>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#1f2e45] bg-[#0c121e] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </a>
              );
            })}

            <div className="mt-4 pt-3 border-t border-gray-800 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-300 py-1 px-2">
                    <span className="font-semibold text-white">{user.name}</span>
                    <span className="font-mono text-gray-400">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-md border border-gray-700 bg-gray-800 py-2 text-center text-xs font-medium text-white"
                  >
                    Log In
                  </a>
                  <a
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-md bg-emerald-600 py-2 text-center text-xs font-semibold text-white"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
