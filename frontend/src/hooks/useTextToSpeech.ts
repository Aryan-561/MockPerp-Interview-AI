'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

let voiceCache: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Initialize voices on mount
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-Speech not supported in your browser');
      return;
    }

    // Load voices
    const loadVoices = () => {
      voiceCache = window.speechSynthesis.getVoices();
      if (voiceCache.length > 0) {
        voicesLoaded = true;
        console.log(`✅ Voices loaded: ${voiceCache.length} available`);
      }
    };

    // Some browsers populate voices asynchronously
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string) => {
    // Clear any previous pending speech
    if (frameIdRef.current !== null) {
      clearTimeout(frameIdRef.current as unknown as NodeJS.Timeout);
    }

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setError('Text-to-Speech not supported in your browser');
      return;
    }

    // Use a shorter timeout now that voices are pre-loaded
    const timeoutId = setTimeout(() => {
      try {
        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Configure speech settings
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        // Use cached voices (already loaded in useEffect)
        let selectedVoice: SpeechSynthesisVoice | undefined;
        
        if (voiceCache.length > 0) {
          // Try to find female voice
          selectedVoice = voiceCache.find(
            (voice) => voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman')
          );
          
          // If no female voice, find google voice or just use first
          if (!selectedVoice) {
            selectedVoice = voiceCache.find((voice) => voice.name.includes('Google'));
          }
          
          // Fallback to first available voice
          if (!selectedVoice) {
            selectedVoice = voiceCache[0];
          }
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`🔊 Using voice: ${selectedVoice.name}`);
        } else {
          console.warn('⚠️ No voices available');
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          setError(null);
          console.log('🔊 Speech started');
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          console.log('🔊 Speech ended');
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          setError(`Speech error: ${event.error}`);
          setIsSpeaking(false);
          console.error('❌ Speech synthesis error:', event.error);
        };

        window.speechSynthesis.speak(utterance);
        console.log('📢 Speaking:', text.substring(0, 50) + '...');
      } catch (err) {
        setError('Failed to initialize speech synthesis');
        console.error('❌ Speech synthesis error:', err);
      }
    }, 50); // Reduced timeout since voices are pre-loaded

    // Store timeout ID for cleanup
    frameIdRef.current = timeoutId as unknown as number;
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    error,
  };
}
