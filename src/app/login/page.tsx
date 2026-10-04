'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Fuel, Lock, ArrowRight, AlertCircle, CheckCircle2, User } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/vehicles';
  const isJustRegistered = searchParams.get('registered') === 'true';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    isJustRegistered ? 'Account created successfully! Please sign in to access your garage.' : ''
  );
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
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          email: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user in client storage for dual-layer authentication
      if (data.token) {
        try {
          localStorage.setItem('fuelwise_token', data.token);
          localStorage.setItem('fuelwise_user', JSON.stringify(data.user));
        } catch {}
      }

      // Broadcast auth change event for components like Navbar
      window.dispatchEvent(new Event('auth-state-changed'));

      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[82vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Floating visionOS Window */}
        <div className="visionos-window p-7 sm:p-9 shadow-2xl">
          <div className="visionos-grab-bar" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/30 mb-4">
              <Fuel className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              Sign in to access your personal garage, trip logs, and calibrated fuel models
            </p>
          </div>

          {/* Success Banner if just registered */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 mb-5 text-xs text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 mb-5 text-xs text-rose-600 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username or Email Address
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. haribashyam or you@example.com"
                  className="w-full visionos-input visionos-input-icon-left text-xs sm:text-sm"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full visionos-input visionos-input-icon-left text-xs sm:text-sm"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="visionos-pill-btn-primary w-full py-3.5 text-xs sm:text-sm font-semibold text-center justify-center mt-4 disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.08]">
            Don&apos;t have an account yet?{' '}
            <Link
              href={`/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-semibold text-red-500 hover:text-red-400 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-xs">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
