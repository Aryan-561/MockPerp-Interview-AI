'use client';

import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/me' },
  { label: 'Interviews', icon: MessageSquare, href: '/interviews', active: true },
  { label: 'Resume Vault', icon: FileText, href: '/resume-vault' },
  { label: 'Skill Map', icon: BarChart2, href: '/skill-map' },
];

function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const router = useRouter();

  return (
    <aside className="w-[210px] shrink-0 h-screen bg-[#111111] border-r border-white/[0.06] flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <p className="text-[#EDEDED] font-bold text-lg leading-none tracking-tight">InterviewAI</p>
        <p className="text-[10px] text-[#555] font-mono tracking-[0.18em] mt-1 uppercase">Technical Suite</p>
      </div>

      <div className="px-4 mb-4">
              <Button
                onClick={() => router.push('/interviews')}
                className="w-full h-9 bg-[#24B47E] hover:bg-[#5adda4] text-black font-semibold text-sm rounded-md border-none gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Interview
              </Button>
            </div>

      <nav className="flex-1 px-2 space-y-0.5 mt-4">
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

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') || 'Candidate';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Speech-to-Text State
  const {
    transcript,
    listening: isListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (isListening) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  // Text-to-Speech State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [revealedChars, setRevealedChars] = useState(0);

  const { useGetMeQuery, useLogoutMutation } = useAuth();
  const { useSendMessageMutation } = useChat();

  const { data: meData, isLoading: meLoading } = useGetMeQuery();
  const logoutMutation = useLogoutMutation();
  const sendMutation = useSendMessageMutation();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!meLoading && !meData) router.replace('/login');
  }, [meData, meLoading, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, revealedChars]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakMessage = (id: string, text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      setRevealedChars(0);
      setSpeakingMessageId(id);

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onboundary = (event) => {
        // Find the next space to reveal the full word
        const nextSpace = text.indexOf(' ', event.charIndex);
        const endOfWord = nextSpace !== -1 ? nextSpace : text.length;
        setRevealedChars(endOfWord);
      };

      utterance.onend = () => {
        setRevealedChars(text.length);
        setSpeakingMessageId(null);
      };
      
      utterance.onerror = () => {
        setRevealedChars(text.length);
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback if not supported
      setSpeakingMessageId(null);
      setRevealedChars(text.length);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sendMutation.isPending) return;

    // Stop listening if sending
    if (isListening) {
      SpeechRecognition.stopListening();
    }
    
    // Stop speaking previous message
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await sendMutation.mutateAsync({ message: userMessage.content });
      
      const aiMessageId = (Date.now() + 1).toString();
      const aiResponseContent = response.message || "I didn't quite catch that. Could you repeat?";

      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          role: 'ai',
          content: aiResponseContent,
        },
      ]);
      
      // Speak and sync word-by-word
      speakMessage(aiMessageId, aiResponseContent);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error visually if needed
    }
  };

  const toggleMic = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition.");
      return;
    }

    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setInputText('');
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleSignOut = async () => {
    await logoutMutation.mutateAsync();
    router.replace('/login');
  };

  if (meLoading || !meData) return null;

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden text-[#EDEDED]">
      <Sidebar onSignOut={handleSignOut} />

      <main className="flex-1 flex flex-col h-full max-w-4xl mx-auto border-l border-r border-white/[0.06] bg-[#0d0d0d] shadow-2xl relative">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-white/[0.06] flex items-center justify-between px-6 bg-[#111111]">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Interview Session</h1>
            <p className="text-xs text-[#24B47E] font-medium mt-0.5">Role: {roleParam}</p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Bot className="w-12 h-12 mb-4 text-[#555]" />
              <p className="text-sm text-[#8B8B8B]">Your interview for the {roleParam} role has started.</p>
              <p className="text-xs text-[#555] mt-1">Introduce yourself to begin!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isCurrentlySpeaking = speakingMessageId === msg.id;
              
              // If it's AI and currently speaking, show only up to revealedChars
              const displayContent = isCurrentlySpeaking 
                ? msg.content.substring(0, revealedChars)
                : msg.content;

              return (
                <div key={msg.id} className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
                  <div className={cn("flex gap-3 max-w-[80%]", isUser ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                      isUser ? "bg-[#24B47E]/20 text-[#24B47E]" : "bg-white/[0.1] text-white"
                    )}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    
                    <div className={cn(
                      "p-4 rounded-xl text-sm leading-relaxed",
                      isUser 
                        ? "bg-[#24B47E] text-black rounded-tr-sm" 
                        : "bg-[#1A1A1A] text-[#EDEDED] border border-white/[0.06] rounded-tl-sm"
                    )}>
                      {displayContent}
                      {isCurrentlySpeaking && revealedChars < msg.content.length && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-[#24B47E] animate-pulse align-middle" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {sendMutation.isPending && (
            <div className="flex w-full justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-white/[0.1] text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-white/[0.06] rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#555] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#555] animate-bounce delay-75" />
                  <span className="w-2 h-2 rounded-full bg-[#555] animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="relative p-4 bg-[#111111] border-t border-white/[0.06]">
          {/* Listening Popup */}
          {isListening && (
            <div className="absolute bottom-[100%] left-0 w-full px-4 pb-4 pointer-events-none z-10">
              <div className="max-w-3xl mx-auto bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
                      <div className="relative w-8 h-8 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20">
                        <Mic className="w-4 h-4 animate-pulse" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[#EDEDED]">Listening...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={toggleMic}
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs rounded-full px-4 text-[#8B8B8B] hover:text-white hover:bg-white/[0.05]"
                    >
                      Pause
                    </Button>
                    <Button 
                      onClick={handleSend}
                      disabled={!inputText.trim() || sendMutation.isPending}
                      size="sm"
                      className="h-8 text-xs rounded-full px-4 bg-[#24B47E] hover:bg-[#5adda4] text-black disabled:opacity-50 shadow-[0_0_15px_rgba(36,180,126,0.15)]"
                    >
                      {sendMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                      Submit
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar px-1 py-1">
                  <p className="text-base text-[#EDEDED] font-light leading-relaxed">
                    {inputText || <span className="text-[#555]">Start speaking...</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMic}
              className={cn(
                "w-11 h-11 rounded-full shrink-0 transition-all",
                isListening 
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400" 
                  : "bg-white/[0.05] text-[#8B8B8B] hover:bg-white/[0.1] hover:text-[#EDEDED]"
              )}
              title={isListening ? "Stop listening" : "Start speaking"}
            >
              {isListening ? (
                <>
                  <span className="absolute w-11 h-11 rounded-full animate-ping bg-red-500/30" />
                  <Mic className="w-5 h-5 relative z-10" />
                </>
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isListening ? "Listening..." : "Type your message..."}
                className="w-full h-11 bg-[#0a0a0a] border-white/[0.08] text-[#EDEDED] placeholder:text-[#555] focus-visible:ring-[#24B47E]/30 focus-visible:border-[#24B47E]/50 rounded-full pl-5 pr-14"
              />
              
              <Button
                onClick={handleSend}
                disabled={!inputText.trim() || sendMutation.isPending}
                className={cn(
                  "absolute right-1 top-1 w-9 h-9 rounded-full p-0 flex items-center justify-center transition-all",
                  inputText.trim() && !sendMutation.isPending
                    ? "bg-[#24B47E] hover:bg-[#5adda4] text-black"
                    : "bg-transparent text-[#555]"
                )}
              >
                {sendMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-[#555]">
              Press <kbd className="px-1 py-0.5 rounded-sm bg-white/[0.05] border border-white/[0.1] font-sans">Enter</kbd> to send
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
