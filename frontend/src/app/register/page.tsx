'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [error, setError] = useState('');

  const { useRegisterMutation, useResendVerificationEmailMutation, useGetMeQuery } = useAuth();
  const registerMutation = useRegisterMutation();
  const resendMutation = useResendVerificationEmailMutation();

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
      await registerMutation.mutateAsync(form);
      setRegisteredEmail(form.email);
      setSubmitted(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Something went wrong. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      await resendMutation.mutateAsync({ email: registeredEmail });
    } catch {
      // silently fail on resend
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff25_1px,transparent_1px),linear-gradient(to_bottom,#ffffff25_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      {/* Vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(0,0,0,0.75)_0%,transparent_100%)] pointer-events-none" />
      {/* Bottom fade */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-4 w-full max-w-3xl">

        {/* ── Left Panel: Registration Form ── */}
        <Card className="flex-1 bg-[#141414] border border-white/10 rounded-xl shadow-2xl">
          <CardContent className="p-8 flex flex-col">
            {/* Logo / Brand */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-[#EDEDED] tracking-tight">InterviewAI</h1>
              <p className="text-sm text-[#8B8B8B] mt-1">Create your technical suite account.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm text-[#EDEDED]">Full Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-[#EDEDED] placeholder:text-[#555] focus-visible:ring-[#24B47E]/40 focus-visible:border-[#24B47E]/60 rounded-md h-11"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm text-[#EDEDED]">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-[#EDEDED] placeholder:text-[#555] focus-visible:ring-[#24B47E]/40 focus-visible:border-[#24B47E]/60 rounded-md h-11"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm text-[#EDEDED]">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
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
                disabled={registerMutation.isPending}
                className="mt-2 h-11 w-full bg-[#24B47E] hover:bg-[#5adda4] text-[#000000] font-semibold rounded-md transition-colors border-none"
              >
                {registerMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Sign in link */}
            <p className="text-sm text-[#8B8B8B] text-center mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-[#24B47E] hover:text-[#5adda4] transition-colors font-medium">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* ── Right Panel: Check Your Email ── */}
        <Card className={`flex-1 bg-[#141414] border border-white/10 rounded-xl shadow-2xl transition-all duration-500 ${submitted ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center gap-5">
            {/* Mail Icon */}
            <div className="w-16 h-16 rounded-xl bg-[#24B47E]/15 border border-[#24B47E]/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#24B47E]" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-3">Check your email</h2>
              <p className="text-sm text-[#8B8B8B] leading-relaxed max-w-xs">
                We&apos;ve sent a verification link to{' '}
                <span className="text-[#EDEDED] font-medium">{registeredEmail || 'your email'}</span>.{' '}
                Please click the link to verify your account and continue to the dashboard.
              </p>
            </div>

            {/* Resend */}
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resendMutation.isPending || !submitted}
              className="w-full h-11 bg-transparent border-white/15 text-[#EDEDED] hover:bg-white/5 hover:text-white transition-colors rounded-md font-medium"
            >
              {resendMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : resendMutation.isSuccess ? (
                '✓ Email sent!'
              ) : (
                'Resend Email'
              )}
            </Button>

            <p className="text-sm text-[#8B8B8B]">
              Need help?{' '}
              <Link href="#" className="text-[#24B47E] hover:text-[#5adda4] transition-colors">
                Contact Support
              </Link>
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
