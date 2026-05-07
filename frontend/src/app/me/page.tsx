'use client';

import { useRouter } from 'next/navigation';
import { Loader2, User, Mail, ShieldCheck, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function MePage() {
  const router = useRouter();
  const { useGetMeQuery, useLogoutMutation } = useAuth();

  const { data, isLoading, isError } = useGetMeQuery();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push('/login');
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-3 text-[#8B8B8B]">
          <Loader2 className="w-8 h-8 animate-spin text-[#24B47E]" />
          <p className="text-sm">Loading your profile…</p>
        </div>
      </PageShell>
    );
  }

  // ── Error / unauthenticated state ──
  if (isError || !data) {
    return (
      <PageShell>
        <Card className="w-full max-w-sm bg-[#141414] border border-white/10 rounded-xl shadow-2xl">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <ShieldAlert className="w-10 h-10 text-red-400" />
            <p className="text-[#EDEDED] font-medium">Session expired or not logged in.</p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-10 bg-[#24B47E] hover:bg-[#5adda4] text-black font-semibold rounded-md border-none transition-colors"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }
  console.log(data)
  const user = data?.data.user ?? data;
  const isVerified = user?.isEmailVerfied ?? user?.isEmailVerified ?? false;

  // ── Profile state ──
  return (
    <PageShell>
      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-3xl font-semibold text-[#EDEDED] tracking-tight">My Account</h1>
        <p className="text-sm text-[#8B8B8B] mt-1">Your InterviewAI profile</p>
      </div>

      <Card className="relative z-10 w-full max-w-sm bg-[#141414] border border-white/10 rounded-xl shadow-2xl">
        <CardContent className="p-6 flex flex-col gap-5">

          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#24B47E]/15 border border-[#24B47E]/25 flex items-center justify-center">
              <User className="w-8 h-8 text-[#24B47E]" />
            </div>
          </div>

          {/* Name */}
          <InfoRow
            icon={<User className="w-4 h-4 text-[#24B47E]" />}
            label="Full Name"
            value={user?.name ?? '—'}
          />

          {/* Email */}
          <InfoRow
            icon={<Mail className="w-4 h-4 text-[#24B47E]" />}
            label="Email"
            value={user?.email ?? '—'}
          />

          {/* Email Verified */}
          <div className="flex items-center justify-between px-4 py-3 rounded-md bg-[#0a0a0a] border border-white/10">
            <div className="flex items-center gap-2">
              {isVerified
                ? <ShieldCheck className="w-4 h-4 text-[#24B47E]" />
                : <ShieldAlert className="w-4 h-4 text-yellow-400" />
              }
              <span className="text-xs text-[#8B8B8B] uppercase tracking-wider">Email Verified</span>
            </div>
            <span className={`text-sm font-semibold ${isVerified ? 'text-[#24B47E]' : 'text-yellow-400'}`}>
              {isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Logout */}
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            variant="outline"
            className="w-full h-11 bg-transparent border-white/10 text-[#EDEDED] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors rounded-md font-medium"
          >
            {logoutMutation.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging out…</>
              : <><LogOut className="w-4 h-4 mr-2" /> Log Out</>
            }
          </Button>

        </CardContent>
      </Card>
    </PageShell>
  );
}

// ── Shared layout shell with grid background ──
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff25_1px,transparent_1px),linear-gradient(to_bottom,#ffffff25_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      {/* Vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(0,0,0,0.75)_0%,transparent_100%)] pointer-events-none" />
      {/* Bottom fade */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

// ── Reusable info row ──
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-[#0a0a0a] border border-white/10">
      {icon}
      <div className="flex flex-col">
        <span className="text-xs text-[#8B8B8B] uppercase tracking-wider">{label}</span>
        <span className="text-sm text-[#EDEDED] font-medium">{value}</span>
      </div>
    </div>
  );
}
