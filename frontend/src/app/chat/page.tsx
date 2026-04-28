'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { ChatMessage, estimateSpeechDuration } from '@/components/ChatMessage';
import { axiosInstance } from '@/utils/axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! I\'m your AI interview assistant. You can type a message or use the microphone button to speak. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { isListening, startListening, stopListening, transcript, resetTranscript, browserSupported } = useSpeechRecognition();
  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();

  // Ensure component is mounted on client before checking browser support
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check backend connection using TanStack Query
  const { data: connectionData, isLoading: checkingConnection } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axiosInstance.get('/health');
      return response.data;
    },
    retry: 1,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const backendConnected = connectionData?.status === 'ok' || !!connectionData;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send message when listening stops and input has text
  useEffect(() => {
    if (transcript && !isListening && inputValue.trim()) {
      setTimeout(() => {
        sendMessage(inputValue);
        resetTranscript();
      }, 500);
    }
  }, [isListening]);

  // Update input field with transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setInputValue(transcript);
    }
  }, [transcript, isListening]);

  const typeMessage = (messageId: string, fullText: string) => {
    const words = fullText.split(' ');
    let currentIndex = 0;
    let lastUpdateTime = Date.now();
    const WORD_DELAY = 400; // ms between words

    const typeNextWord = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= WORD_DELAY) {
        if (currentIndex <= words.length) {
          const displayText = words.slice(0, currentIndex).join(' ');
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, text: displayText }
                : msg
            )
          );

          if (currentIndex < words.length) {
            currentIndex++;
            lastUpdateTime = now;
          }
        }
      }
      
      if (currentIndex < words.length) {
        typingTimer.current = requestAnimationFrame(typeNextWord);
      }
    };

    typeNextWord();
  };

  // TanStack Query mutation for sending messages
  const sendChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await axiosInstance.post('/chat', { message });
      return response.data.data?.message || response.data.message || 'Sorry, I couldn\'t understand that.';
    },
    onMutate: (message) => {
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
    },
    onSuccess: (aiMessage) => {
      console.log('📥 Received response from backend:', aiMessage);

      const messageId = Date.now().toString();
      const aiMessageObj: Message = {
        id: messageId,
        text: aiMessage,
        sender: 'ai',
        timestamp: new Date(),
      };

      // Add message with full text immediately
      setMessages((prev) => [...prev, aiMessageObj]);
      setError('');

      // Enable speech synthesis
      setSpeakingMessageId(messageId);
      speak(aiMessage);
    },
    onError: (err) => {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get response';
      setError(`❌ Error: ${errorMsg}`);
      console.error('❌ Backend error:', err);
    },
  });

  const sendMessage = async (message: string) => {
    if (!message.trim() || sendChatMutation.isPending) return;

    if (!backendConnected) {
      setError('⚠️ Backend server is not connected. Please check if the backend is running.');
      console.error('Backend not connected');
      return;
    }

    console.log('📤 Sending message to backend:', message);
    await sendChatMutation.mutateAsync(message);
  };

  const handleSendClick = () => {
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const startMicrophone = async () => {
    setError('');
    await startListening();
  };

  const stopMicrophone = () => {
    stopListening();
  };

  // Show browser not supported only after hydration
  if (isMounted && !browserSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border-2 border-red-400">
          <p className="text-lg font-semibold text-red-600">❌ Browser not supported</p>
          <p className="text-gray-600 mt-2">Please use Chrome, Edge, or Safari for full functionality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">💬 AI Interview Assistant</h1>
            <p className="text-blue-100 text-sm">Talk or type your message</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'} bg-opacity-20`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-sm font-medium ${backendConnected ? 'text-green-700' : 'text-red-700'}`}>
                {checkingConnection ? 'Checking...' : backendConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            {isSpeaking && (
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Speaking...</span>
              </div>
            )}
            {isListening && (
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Listening...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Error Banner */}
      {!backendConnected && !checkingConnection && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700 text-sm">
            ⚠️ Backend server is not running. Start the backend with: <code className="bg-yellow-200 px-2 py-1 rounded">npm start</code>
          </p>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-8">
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              isSpeaking={speakingMessageId === message.id}
            />
          ))}
          {sendChatMutation.isPending && (
            <div className="flex gap-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                AI
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex gap-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                ⚠️
              </div>
              <div className="flex-1">
                <div className="bg-red-50 rounded-lg shadow-sm p-4 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Listening Status */}
      {isListening && transcript && (
        <div className="bg-blue-50 border-t-2 border-blue-400 p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-700 font-medium">
              <span className="font-semibold text-blue-600">🎤 Listening:</span>
            </p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed break-words">{transcript}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            {/* Microphone Button */}
            <button
              onClick={isListening ? stopMicrophone : startMicrophone}
              disabled={sendChatMutation.isPending || isSpeaking}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-300 disabled:text-gray-400'
              }`}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              {isListening ? '🛑' : '🎤'}
            </button>

            {/* Text Input */}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or click the microphone..."
              disabled={sendChatMutation.isPending}
              rows={1}
              className="flex-1 px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none disabled:bg-gray-100 text-gray-900 font-medium placeholder-gray-500"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSendClick}
              disabled={sendChatMutation.isPending || !inputValue.trim()}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
              title="Send message"
            >
              {sendChatMutation.isPending ? '⏳' : '📤'}
            </button>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={() => {
                  stopSpeaking();
                  setSpeakingMessageId(null);
                }}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition-all duration-200 flex items-center justify-center shadow-md"
                title="Stop speaking"
              >
                ⏹️
              </button>
            )}

            {/* Clear Button */}
            {inputValue.trim() && (
              <button
                onClick={() => {
                  setInputValue('');
                }}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all duration-200 flex items-center justify-center shadow-md"
                title="Clear input"
              >
                ❌
              </button>
            )}
          </div>

          {/* Display when listening stopped but input exists */}
          {!isListening && inputValue.trim() && (
            <div className="mt-3 p-3 bg-green-50 border-2 border-green-400 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-green-600">✅ Ready to send</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
