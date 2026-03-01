// src/hooks/useVoiceRecognition.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Status } from '@/types/expense';

// ประกาศ Type สำหรับ Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

interface UseVoiceRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  status: Status;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useVoiceRecognition(
  language: 'th-TH' | 'en-US' = 'th-TH'
): UseVoiceRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    // ตรวจสอบ Browser Support
    const SpeechRecognition = 
      (window as unknown as Record<string, unknown>).SpeechRecognition || 
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new (SpeechRecognition as new () => SpeechRecognitionInstance)();
      recognition.continuous = true;       // ฟังต่อเนื่อง
      recognition.interimResults = true;   // แสดงผลระหว่างพูด
      recognition.lang = language;

      recognition.onstart = () => {
        setStatus('listening');
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }

        if (finalText) {
          setTranscript(prev => prev + finalText);
        }
        setInterimTranscript(interimText);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`เกิดข้อผิดพลาด: ${event.error}`);
        setStatus('error');
      };

      recognition.onend = () => {
        setInterimTranscript('');
        if (status === 'listening') {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && status === 'idle') {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    }
  }, [status]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && status === 'listening') {
      recognitionRef.current.stop();
      setStatus('processing');
    }
  }, [status]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setStatus('idle');
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    status,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}