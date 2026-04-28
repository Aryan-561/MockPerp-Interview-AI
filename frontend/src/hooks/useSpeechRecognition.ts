'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition as useSR } from 'react-speech-recognition';

export function useSpeechRecognition() {
  const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } = useSR();
  const [error, setError] = useState<string | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const maxDurationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect silence - stop only if no new speech for 3 seconds
  useEffect(() => {
    if (!listening) {
      // Clear timers when listening stops
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      if (maxDurationTimer.current) clearTimeout(maxDurationTimer.current);
      return;
    }

    // Check if transcript has changed
    if (transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      
      // Reset silence timer - user is speaking
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      console.log('🎤 Speech detected, silence timer reset');

      // Set new silence timer - stop after 3 seconds of no new speech
      silenceTimer.current = setTimeout(() => {
        console.log('⏹ Stopped due to 3s of silence');
        SpeechRecognition.stopListening();
      }, 8000);
    }
  }, [listening, transcript]);

  const startListening = useCallback(async () => {
    resetTranscript();
    lastTranscriptRef.current = '';
    setError(null);

    try {
      // Request microphone permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
        language: 'en-US',
      });

      console.log('🎤 Listening started');

      // Optional: Set max duration of 60 seconds to prevent infinite recording
      if (maxDurationTimer.current) clearTimeout(maxDurationTimer.current);
      maxDurationTimer.current = setTimeout(() => {
        console.log('⏹ Max recording duration reached (60s)');
        SpeechRecognition.stopListening();
      }, 60000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Microphone error:', errorMsg);

      if (errorMsg.includes('NotAllowedError') || errorMsg.includes('Permission')) {
        setError('🔒 Microphone permission denied. Please allow microphone access.');
      } else if (errorMsg.includes('NotFoundError')) {
        setError('❌ No microphone found on this device.');
      } else {
        setError(`❌ Microphone error: ${errorMsg}`);
      }
    }
  }, [resetTranscript]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
    }
    if (maxDurationTimer.current) {
      clearTimeout(maxDurationTimer.current);
    }
  }, []);

  return {
    isListening: listening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupported: browserSupportsSpeechRecognition,
  };
}
