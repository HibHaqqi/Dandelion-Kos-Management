'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, User, Lock, Eye, EyeOff, MessageCircle } from 'lucide-react';

export default function TenantLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect based on role
      if (data.user.role === 'TENANT') {
        router.push('/tenant/dashboard');
      } else if (data.user.role === 'ADMIN') {
        router.push('/home');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-zinc-950 dark:to-zinc-900 flex">
      {/* Left Section - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJfI7ndUe39CON0V1FkncyHeao_kzlFaYlM_LaL3sb90ETcIrw-SJJFjRIaU8fFHo2R6hIFjFBJnvZfe39-G0xng9l0dGRpkJC4xrPXn1TDrkR-8ZQ5w6qXAEw5G-ZltFza32nE18e9Nj_QPyrKvyfD2A7gBocrxc3uFUm5w5dEFbDo2bbqaEA0FM35t30bYFX73Dlp2y-Szmxs35hZzqBYW5-47q_GJxx38vs2pmKFhuUCwCMMjaGNHMoaT5YWLhc6Gyq0TeNtk8')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-12 left-12 z-10 max-w-md text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold">Dandelion Kos</h1>
          </div>
          <p className="text-lg text-white/90 leading-relaxed">
            Premium living spaces designed for your comfort and productivity. Welcome to your community.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Dandelion Kos</h2>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-teal-100 dark:border-zinc-800">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Tenant Login</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Access your room management portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" strokeWidth={2} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="Enter your email or phone"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" strokeWidth={2} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
              >
                {loading ? 'Signing in...' : 'Login to Dashboard'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Don't have an account?{' '}
                <Link
                  href="/tenant/register"
                  className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
                >
                  Register here
                </Link>
              </p>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-zinc-900 text-zinc-500">Need Help?</span>
              </div>
            </div>

            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-teal-400 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold py-3 transition"
            >
              <MessageCircle className="w-5 h-5" strokeWidth={2} />
              Contact Admin via WhatsApp
            </a>

            <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
              © 2024 Dandelion Kos. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
