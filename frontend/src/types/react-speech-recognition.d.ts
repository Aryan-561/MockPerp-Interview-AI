declare module 'react-speech-recognition' {
  export interface SpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
  }

  export interface UseSpeechRecognitionOptions {
    transcribing?: boolean;
    clearTranscriptOnListen?: boolean;
    commands?: any[];
  }

  export function useSpeechRecognition(options?: UseSpeechRecognitionOptions): {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
  };

  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => Promise<void>;
    stopListening: () => void;
    abortListening: () => void;
    browserSupportsSpeechRecognition: () => boolean;
    applyPolyfill: (SpeechRecognitionPolyfill: any) => void;
  };

  export default SpeechRecognition;
}
