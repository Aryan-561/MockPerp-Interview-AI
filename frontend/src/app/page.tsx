'use client';

import Link from 'next/link';
import { PlayCircle, ArrowRight, User, Bot, MoreHorizontal, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { useGetMeQuery } = useAuth();
  const { data: meData, isLoading } = useGetMeQuery();

  return (
    <div className="min-h-screen bg-[#000000] text-[#8B8B8B] font-sans selection:bg-[#24B47E]/30 overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff25_1px,transparent_1px),linear-gradient(to_bottom,#ffffff25_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      {/* Vignette — fades grid toward center where content lives */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(0,0,0,0.7)_0%,transparent_100%)] pointer-events-none" />
      {/* Bottom fade */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-[#EDEDED] tracking-tight">InterviewAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8B8B8B]">
          <div className="relative">
             <Link href="#" className="text-[#EDEDED]">Platform</Link>
             <div className="absolute -bottom-[23px] left-0 w-full h-[2px] bg-[#24B47E]" />
          </div>
          <Link href="#" className="hover:text-[#EDEDED] transition-colors">Resources</Link>
          <Link href="#" className="hover:text-[#EDEDED] transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-[#EDEDED] transition-colors">Docs</Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : meData ? (
            <Link href="/me">
              <Avatar className="w-8 h-8 cursor-pointer border border-white/10 hover:border-white/30 transition-colors">
                <AvatarFallback className="bg-[#24B47E]/10 text-[#24B47E]">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <>
              <Link href="/login" passHref>
                 <Button variant="ghost" className="rounded-sm text-[#EDEDED] hover:text-[#ffffff] hover:bg-white/5 transition-colors border border-transparent">Sign In</Button>
              </Link>
              <Link href="/register" passHref>
                 <Button className="rounded-sm bg-[#24B47E] text-[#000000] hover:bg-[#5adda4] transition-colors font-semibold border-none">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-20 px-6 max-w-4xl mx-auto text-center">
        {/* Hero */}
        <h1 className="text-5xl md:text-[5rem] font-semibold text-[#EDEDED] tracking-tight leading-[1.2] mb-6">
          Ace Your Next Technical<br />
          Interview <span className="text-[#24B47E]">with AI</span>
        </h1>
        <p className="text-lg md:text-xl text-[#8B8B8B] mb-10 max-w-2xl leading-[1.6]">
          Practice coding, system design, and behavioral questions with an advanced AI interviewer. Get real-time feedback, detailed skill mapping, and master your technical communication in a zero-pressure environment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 w-full sm:w-auto relative">
          <Link href="/interviews" passHref className="w-full sm:w-auto">
             <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#24B47E] text-[#000000] font-semibold hover:bg-[#5adda4] transition-colors px-8 py-6 text-base rounded-sm border-none shadow-[0_0_40px_-10px_rgba(36,180,126,0.3)]">
                Start Interview <ArrowRight className="w-5 h-5 ml-2" />
             </Button>
          </Link>
        </div>

        {/* Mockup */}
        <div className="relative w-full mb-24">
          {/* Subtle Radial Glow Behind Mockup */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(36,180,126,0.05)_0%,transparent_70%)] scale-150 -z-10" />
          
          <Card className="w-full bg-[#1C1C1C] border-white/10 shadow-none text-left overflow-hidden rounded-xl border">
            {/* Mockup Header */}
            <CardHeader className="flex flex-row items-center justify-center px-4 py-3 bg-[#1C1C1C] border-b border-white/10 relative rounded-none space-y-0 p-0 h-12">
               <div className="absolute left-4 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] opacity-80" />
               </div>
               <span className="text-xs text-[#8B8B8B] font-mono">session_id: ax92-b4</span>
            </CardHeader>

            {/* Mockup Content */}
            <CardContent className="p-6 space-y-6">
              {/* AI Message */}
              <div className="flex items-start gap-4">
                <Avatar className="w-8 h-8 rounded-sm bg-[#24B47E]/10 border-none">
                   <AvatarFallback className="bg-transparent rounded-sm flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#24B47E]" />
                   </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 w-full max-w-[80%] bg-[#000000] border border-white/10 rounded-lg p-4 text-sm text-[#EDEDED] leading-[1.6]">
                  <span className="text-xs text-[#8B8B8B] font-medium mb-1">InterviewAI</span>
                  <p className="mb-2">Welcome to your Senior Backend Engineer mock interview. We'll start with a system design question.</p>
                  <p>Design a rate limiter for a distributed API. Walk me through your high-level architecture and the specific algorithm you'd choose.</p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start gap-4 flex-row-reverse">
                <Avatar className="w-8 h-8 rounded-full bg-[#393939] border-none">
                   <AvatarFallback className="bg-transparent rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-[#EDEDED]" />
                   </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 w-full max-w-[80%] bg-[#000000] border border-[#24B47E]/30 rounded-lg p-4 text-sm text-[#EDEDED] leading-[1.6]">
                   <span className="text-xs text-[#24B47E] font-medium mb-1">You</span>
                   <p>Sure. I'd likely start with a Token Bucket algorithm backed by Redis to handle distributed state. We need to define the bucket size and the refill rate.</p>
                </div>
              </div>

               {/* Typing Indicator */}
               <div className="flex items-start gap-4">
                <Avatar className="w-8 h-8 rounded-sm bg-[#24B47E]/10 border-none">
                   <AvatarFallback className="bg-transparent rounded-sm flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#24B47E]" />
                   </AvatarFallback>
                </Avatar>
                <div className="flex gap-1 items-center bg-[#000000] border border-white/10 rounded-lg px-4 py-3 h-[44px]">
                   <MoreHorizontal className="w-5 h-5 text-[#24B47E] animate-pulse" />
                </div>
              </div>
            </CardContent>

            {/* Mockup Input */}
            <CardFooter className="p-4 bg-[#1C1C1C] border-t border-white/10">
               <div className="flex w-full items-center gap-2 bg-[#000000] border border-white/10 rounded-sm p-1 pl-4 relative focus-within:border-[#24B47E] focus-within:shadow-[0_0_15px_-3px_rgba(36,180,126,0.2)] transition-all">
                  <Input 
                    type="text" 
                    placeholder="Type your approach or upload a diagram..." 
                    className="flex-1 bg-transparent text-sm text-[#EDEDED] border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#8B8B8B] px-0 h-10 rounded-sm"
                    disabled
                  />
                  <Button size="icon" className="h-10 w-10 bg-[#24B47E] text-[#000000] hover:bg-[#5adda4] transition-colors shrink-0 rounded-sm">
                    <Send className="w-4 h-4" />
                  </Button>
               </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#000000] relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#8B8B8B]">
          <div className="flex items-center gap-2">
            <span className="text-[#EDEDED] font-semibold">InterviewAI</span>
            <span>© 2024 InterviewAI. Infrastructure for technical hiring.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-[#EDEDED] transition-colors">Status</Link>
            <Link href="#" className="hover:text-[#EDEDED] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#EDEDED] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#EDEDED] transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
