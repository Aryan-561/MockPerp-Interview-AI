'use client';

import { useEffect, useState } from 'react';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  };
  isSpeaking?: boolean;
}

// Calculate estimated speech duration in milliseconds
// Average speech rate: ~150 words per minute or ~13ms per character
export function estimateSpeechDuration(text: string): number {
  return text.length * 13; // ~13ms per character at normal speech rate
}

export function ChatMessage({ message, isSpeaking = false }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const isUser = message.sender === 'user';
  const [isTyping, setIsTyping] = useState(!isUser && message.id !== 'initial');

  useEffect(() => {
    if (isUser) {
      setDisplayedText(message.text);
      setIsTyping(false);
      return;
    }

    // For AI messages, sync typing animation with speech synthesis
    // Calculate typing speed based on message length and estimated speech duration
    const estimatedDuration = estimateSpeechDuration(message.text);
    const charCount = message.text.length;
    const typingSpeed = Math.max(60, Math.floor(estimatedDuration / charCount)); // Min 40ms per char - slower reveal

    let index = 0;
    const interval = setInterval(() => {
      if (index < message.text.length) {
        setDisplayedText(message.text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [message.text, isUser, message.id]);

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mt-1 ${
          isUser
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Message Container */}
      <div className={`flex flex-col gap-1 flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`max-w-xs lg:max-w-md rounded-lg px-4 py-3 shadow-sm border transition-all duration-300 ${
            isUser
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600 rounded-br-none'
              : 'bg-white text-gray-900 border-gray-200 rounded-bl-none'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{displayedText}</p>
          {(isTyping || isSpeaking) && (
            <span className="inline-block w-2 h-4 ml-1 bg-current opacity-70 rounded animate-pulse"></span>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-500 px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
