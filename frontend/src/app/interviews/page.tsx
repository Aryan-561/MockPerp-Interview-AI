'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  FileUp,
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useUpload } from '@/hooks/useUpload';
import { cn } from '@/lib/utils';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Interviews', icon: MessageSquare, href: '/interviews', active: true },
  { label: 'Resume Vault', icon: FileText, href: '/resume-vault' },
  { label: 'Skill Map', icon: BarChart2, href: '/skill-map' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

// ─── Role quick-select suggestions ───────────────────────────────────────────
const ROLE_SUGGESTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'MERN Stack Developer',
  'React Developer',
  'Node.js Developer',
  'DevOps Engineer',
  'Data Structures & Algorithms',
];


// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const router = useRouter();

  return (
    <aside className="w-[210px] shrink-0 h-screen bg-[#111111] border-r border-white/[0.06] flex flex-col">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <p className="text-[#EDEDED] font-bold text-lg leading-none tracking-tight">InterviewAI</p>
        <p className="text-[10px] text-[#555] font-mono tracking-[0.18em] mt-1 uppercase">Technical Suite</p>
      </div>

      {/* New Interview */}
      <div className="px-4 mb-4">
        <Button
          onClick={() => router.push('/interviews')}
          className="w-full h-9 bg-[#24B47E] hover:bg-[#5adda4] text-black font-semibold text-sm rounded-md border-none gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Interview
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, href, active }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left',
              active
                ? 'bg-white/[0.07] text-[#EDEDED] border-l-2 border-[#24B47E]'
                : 'text-[#666] hover:text-[#EDEDED] hover:bg-white/[0.04]'
            )}
          >
            <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-[#24B47E]' : '')} />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-6 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#555] hover:text-[#EDEDED] hover:bg-white/[0.04] transition-colors">
          <HelpCircle className="w-4 h-4 shrink-0" />
          Support
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#555] hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────
function DropZone({
  file,
  onFile,
  isDragging,
  setIsDragging,
}: {
  file: File | null;
  onFile: (f: File) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped?.type === 'application/pdf') onFile(dropped);
    },
    [onFile, setIsDragging]
  );

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 py-12',
        isDragging
          ? 'border-[#24B47E] bg-[#24B47E]/[0.06]'
          : file
          ? 'border-[#24B47E]/50 bg-[#24B47E]/[0.04]'
          : 'border-white/[0.12] bg-[#0d0d0d] hover:border-white/25 hover:bg-white/[0.02]'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {file ? (
        <>
          <CheckCircle2 className="w-10 h-10 text-[#24B47E]" />
          <div className="text-center">
            <p className="text-sm text-[#EDEDED] font-medium">{file.name}</p>
            <p className="text-xs text-[#555] mt-1">{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <FileUp className="w-6 h-6 text-[#555]" />
          </div>
          <div className="text-center">
            <p className="text-sm text-[#8B8B8B]">Drag and drop your Resume (PDF) here</p>
            <p className="text-xs text-[#444] mt-1">or click to browse your files</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InterviewsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const { useGetMeQuery, useLogoutMutation } = useAuth();
  const { useUploadResumeMutation } = useUpload();

  // Auth guard — redirect if not logged in
  const { data: meData, isLoading: meLoading } = useGetMeQuery();
  useEffect(() => {
    if (!meLoading && !meData) router.replace('/login');
  }, [meData, meLoading, router]);

  const logoutMutation = useLogoutMutation();
  const uploadMutation = useUploadResumeMutation();

  const canStart = !!file && role.trim().length > 0 && !uploadMutation.isPending;

  const handleStart = async () => {
    if (!file || !canStart) return;
    setUploadError('');
    try {
      await uploadMutation.mutateAsync({ file, role: role.trim() });
      // Navigate to the chat session after successful upload
      router.push(`/chat?role=${encodeURIComponent(role.trim())}`);
    } catch {
      setUploadError('Failed to upload resume. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await logoutMutation.mutateAsync();
    router.replace('/login');
  };

  if (meLoading || !meData) return null;

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar onSignOut={handleSignOut} />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">

          {/* Card */}
          <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-8 shadow-2xl">

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-[#EDEDED] tracking-tight">
                Set up your interview
              </h1>
              <p className="text-sm text-[#555] mt-2">
                Upload your credentials to initialize the technical screening environment.
              </p>
            </div>

            {/* Drop zone */}
            <DropZone
              file={file}
              onFile={setFile}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />

            {/* Role input */}
            <div className="mt-6">
              <label
                htmlFor="role"
                className="block text-[10px] font-semibold tracking-[0.15em] text-[#555] uppercase mb-2"
              >
                What role are you interviewing for?
              </label>
              <div className="relative">
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="(e.g., Frontend Developer)"
                  className="bg-[#0d0d0d] border-white/[0.08] text-[#EDEDED] placeholder:text-[#333] focus-visible:ring-[#24B47E]/30 focus-visible:border-[#24B47E]/50 rounded-md h-11 pr-10"
                />
                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
              </div>

              {/* Quick-select chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {ROLE_SUGGESTIONS.map((suggestion) => {
                  const isActive = role === suggestion;
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setRole(isActive ? '' : suggestion)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150',
                        isActive
                          ? 'bg-[#24B47E]/15 border-[#24B47E]/50 text-[#24B47E]'
                          : 'bg-white/[0.03] border-white/[0.08] text-[#555] hover:border-white/20 hover:text-[#8B8B8B]'
                      )}
                    >
                      {suggestion}
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Error */}
            {uploadError && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {/* CTA */}
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className={cn(
                'mt-6 w-full h-11 rounded-md font-semibold text-sm tracking-widest uppercase transition-all duration-200 border-none gap-2',
                canStart
                  ? 'bg-[#24B47E] hover:bg-[#5adda4] text-black'
                  : 'bg-white/[0.05] text-[#444] cursor-not-allowed'
              )}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Start Interview →'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
