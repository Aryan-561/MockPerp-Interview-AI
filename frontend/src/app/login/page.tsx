'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { useLoginMutation, useGetMeQuery } = useAuth();
  const loginMutation = useLoginMutation();

  // ── Auth guard: redirect logged-in users away from this page ──
  const { data: meData, isLoading: meLoading } = useGetMeQuery();
  useEffect(() => {
    if (!meLoading && meData) {
      router.replace('/me');
    }
  }, [meData, meLoading, router]);

  // Don't flash the form while we check auth status
  if (meLoading || meData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginMutation.mutateAsync(form);
      router.push('/me');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff25_1px,transparent_1px),linear-gradient(to_bottom,#ffffff25_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      {/* Vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(0,0,0,0.75)_0%,transparent_100%)] pointer-events-none" />
      {/* Bottom fade */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent pointer-events-none" />

      {/* Heading above card */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-3xl font-semibold text-[#EDEDED] tracking-tight">InterviewAI</h1>
        <p className="text-sm text-[#8B8B8B] mt-1">Welcome back</p>
      </div>

      {/* Card */}
      <Card className="relative z-10 w-full max-w-sm bg-[#141414] border border-white/10 rounded-xl shadow-2xl">
        <CardContent className="p-6 flex flex-col gap-5">

          {/* Error */}
          {error && (
            <div className="px-4 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm text-[#EDEDED]">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                className="bg-[#0a0a0a] border-white/10 text-[#EDEDED] placeholder:text-[#555] focus-visible:ring-[#24B47E]/40 focus-visible:border-[#24B47E]/60 rounded-md h-11"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm text-[#EDEDED]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#8B8B8B] hover:text-[#EDEDED] transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="bg-[#0a0a0a] border-white/10 text-[#EDEDED] placeholder:text-[#555] focus-visible:ring-[#24B47E]/40 focus-visible:border-[#24B47E]/60 rounded-md h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#8B8B8B] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-1 h-11 w-full bg-[#24B47E] hover:bg-[#5adda4] text-[#000000] font-semibold rounded-md transition-colors border-none"
            >
              {loginMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Sign up link */}
          <p className="text-sm text-[#8B8B8B] text-center">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-[#24B47E] hover:text-[#5adda4] transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
