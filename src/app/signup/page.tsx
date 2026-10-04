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
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/vehicles';

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [error, setError] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect automatically
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.push(redirectUrl);
        }
      })
      .catch(() => {});
  }, [redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsExistingUser(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase() || undefined,
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
            <h2 className="text-2xl font-bold tracking-tight text-white">Create an Account</h2>
            <p className="mt-1 text-xs text-slate-400">
              Set up your personal garage to track individual vehicles, trip logs, and personalized calibrations
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 mb-5 text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              {isExistingUser && (
                <div className="mt-2.5 pt-2 border-t border-rose-500/20">
                  <Link
                    href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                    className="inline-flex items-center gap-1 font-semibold text-white underline hover:text-red-200"
                  >
                    Click here to Sign In to your existing account &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username <span className="text-slate-500 text-[10px]">(unique identifier)</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <AtSign className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="e.g. haribashyam"
                  className="w-full visionos-input pl-10 text-xs"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hari Bashyam"
                  className="w-full visionos-input pl-10 text-xs"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full visionos-input pl-10 text-xs"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full visionos-input pl-10 text-xs"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Units</label>
                <select
                  value={unitSystem}
                  onChange={(e) => setUnitSystem(e.target.value)}
                  className="w-full visionos-input text-xs cursor-pointer"
                >
                  <option value="metric" className="bg-[#0b101d] text-white">Metric (km, L, km/L)</option>
                  <option value="imperial" className="bg-[#0b101d] text-white">Imperial (mi, gal, MPG)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full visionos-input text-xs cursor-pointer"
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
              className="visionos-pill-btn-primary w-full py-3.5 text-xs font-semibold text-center justify-center mt-3 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Your Account...' : 'Register & Enter Garage'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5 pt-4 border-t border-white/[0.08]">
            Already have an account?{' '}
            <Link
              href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-semibold text-red-400 hover:text-red-300 transition-colors"
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
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-white text-xs">Loading signup...</div>}>
      <SignupForm />
    </Suspense>
  );
}
