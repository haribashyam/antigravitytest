'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Gauge,
  Lock,
  Mail,
  User,
  AtSign,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { authFetch } from '@/lib/apiClient';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectUrl =
    rawRedirect && !rawRedirect.startsWith('/login') && !rawRedirect.startsWith('/signup')
      ? rawRedirect
      : '/vehicles';

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [error, setError] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect automatically
  useEffect(() => {
    authFetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.push(redirectUrl);
        } else {
          try {
            localStorage.removeItem('fuelwise_token');
            localStorage.removeItem('fuelwise_user');
          } catch {}
        }
      })
      .catch(() => {});
  }, [redirectUrl, router]);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsExistingUser(false);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setLoading(true);

    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase();

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername || undefined,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          currency,
          unitSystem,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setIsExistingUser(true);
        }
        throw new Error(data.error || 'Registration failed');
      }

      // Store token and user in client storage for dual-layer authentication
      if (data.token) {
        try {
          localStorage.setItem('fuelwise_token', data.token);
          localStorage.setItem('fuelwise_user', JSON.stringify(data.user));
        } catch {}
      }

      // Notify Navbar and other listeners
      window.dispatchEvent(new Event('auth-state-changed'));

      // Redirect directly to vehicles page so user can add vehicles immediately
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="visionos-window p-7 sm:p-9 shadow-2xl">
          <div className="visionos-grab-bar" />

          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/30 mb-4">
              <Gauge className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create an Account</h2>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              Set up your personal garage to track individual vehicles, trip logs, and personalized calibrations
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 mb-5 text-xs text-rose-600 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              {isExistingUser && (
                <div className="mt-2.5 pt-2 border-t border-rose-500/20">
                  <Link
                    href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                    className="inline-flex items-center gap-1 font-semibold text-red-500 underline hover:text-red-400"
                  >
                    Click here to Sign In to your existing account &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hari Bashyam"
                  className="w-full visionos-input visionos-input-icon-left text-xs sm:text-sm"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username <span className="text-slate-500 text-[10px] font-normal">(optional handle)</span>
                </label>
                <span className="text-[10px] text-slate-400">auto-created if blank</span>
              </div>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <AtSign className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="e.g. haribashyam (or leave empty)"
                  className="w-full visionos-input visionos-input-icon-left text-xs sm:text-sm"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full visionos-input visionos-input-icon-left text-xs sm:text-sm"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-medium text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300 transition-colors focus:outline-none flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showPassword ? 'Hide Password' : 'Show Password'}</span>
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full visionos-input visionos-input-icon-left visionos-input-icon-right text-xs sm:text-sm"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                {passwordsMatch && (
                  <span className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="text-[11px] font-medium text-rose-500">
                    Passwords do not match
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full visionos-input visionos-input-icon-left visionos-input-icon-right text-xs sm:text-sm ${
                    passwordsMismatch ? 'border-rose-500/50 focus:border-rose-500' : ''
                  }`}
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Units
                </label>
                <select
                  value={unitSystem}
                  onChange={(e) => setUnitSystem(e.target.value)}
                  className="w-full visionos-input text-xs sm:text-sm cursor-pointer"
                >
                  <option value="metric" className="bg-[#0b101d] text-white">Metric (km, L, km/L)</option>
                  <option value="imperial" className="bg-[#0b101d] text-white">Imperial (mi, gal, MPG)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full visionos-input text-xs sm:text-sm cursor-pointer"
                >
                  <option value="INR" className="bg-[#0b101d] text-white">INR (₹)</option>
                  <option value="USD" className="bg-[#0b101d] text-white">USD ($)</option>
                  <option value="EUR" className="bg-[#0b101d] text-white">EUR (€)</option>
                  <option value="GBP" className="bg-[#0b101d] text-white">GBP (£)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="visionos-pill-btn-primary w-full py-3.5 text-xs sm:text-sm font-semibold text-center justify-center mt-4 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Your Account...' : 'Register & Enter Garage'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.08]">
            Already have an account?{' '}
            <Link
              href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-semibold text-red-500 hover:text-red-400 transition-colors"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-xs">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
