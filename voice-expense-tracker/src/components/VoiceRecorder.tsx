// src/components/VoiceRecorder.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Mic, MicOff, X, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { processVoiceText } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { ExpenseForm } from './ExpenseForm';
import { clsx } from 'clsx';

export function VoiceRecorder() {
  const { data: session } = useSession();
  const [language, setLanguage] = useState<'th-TH' | 'en-US'>('th-TH');
  
  const {
    transcript,
    interimTranscript,
    status: voiceStatus,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError,
  } = useVoiceRecognition(language);

  const {
    currentTransaction,
    status,
    setCurrentTransaction,
    setStatus,
    addTransaction,
    removeLastTransaction,
  } = useExpenseStore();

  // ส่ง transcript ไปประมวลผลเมื่อหยุดอัดเสียง
  useEffect(() => {
    if (voiceStatus === 'processing' && transcript) {
      handleProcessVoice(transcript);
    }
  }, [voiceStatus, transcript]);

  const handleProcessVoice = async (text: string) => {
    if (!text.trim()) {
      setStatus('idle');
      return;
    }

    setStatus('processing');
    
    try {
      const response = await processVoiceText({
        text: text.trim(),
        user_id: session?.user?.email || 'anonymous',
        timestamp: new Date().toISOString(),
      });

      if (response.success && response.data) {
        setCurrentTransaction(response.data);
        setStatus('confirming');
      } else if (response.requiresConfirmation) {
        // AI ต้องการข้อมูลเพิ่มเติม
        toast(response.question || 'กรุณาระบุข้อมูลเพิ่มเติม');
        setStatus('idle');
      } else {
        throw new Error(response.message || 'ประมวลผลไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  const handleCancelLast = () => {
    removeLastTransaction();
    toast.success('ยกเลิกรายการล่าสุดแล้ว');
  };

  const handleConfirm = (transaction: typeof currentTransaction) => {
    if (!transaction) return;
    addTransaction(transaction);
    setStatus('saved');
    resetTranscript();
    toast.success(`บันทึก ${transaction.items.length} รายการแล้ว ✅`);
    
    // Reset กลับ idle หลัง 2 วินาที
    setTimeout(() => setStatus('idle'), 2000);
  };

  if (!isSupported) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl">
        <p className="text-red-600 dark:text-red-400 font-medium">
          ⚠️ เบราว์เซอร์ของคุณไม่รองรับ Voice Recognition
        </p>
        <p className="text-sm text-gray-500 mt-2">
          กรุณาใช้ Chrome หรือ Edge เวอร์ชันล่าสุด
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      
      {/* Status Badge */}
      <StatusBadge status={status === 'idle' ? voiceStatus : status} />

      {/* Language Selector */}
      <div className="flex justify-center gap-3">
        {(['th-TH', 'en-US'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={clsx(
              'px-3 py-1 rounded-full text-sm transition-all',
              language === lang
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}
          >
            {lang === 'th-TH' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
        ))}
      </div>

      {/* Main Voice Button */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={voiceStatus === 'listening' ? stopListening : startListening}
          disabled={status === 'processing' || status === 'confirming'}
          className={clsx(
            'relative w-32 h-32 rounded-full flex items-center justify-center',
            'shadow-2xl transition-all duration-300 transform active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            voiceStatus === 'listening'
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700'
          )}
          aria-label={voiceStatus === 'listening' ? 'หยุดอัดเสียง' : 'เริ่มอัดเสียง'}
        >
          {voiceStatus === 'listening' ? (
            <MicOff className="w-14 h-14 text-white" />
          ) : (
            <Mic className="w-14 h-14 text-white" />
          )}
          
          {/* Ripple Effect เมื่อกำลังฟัง */}
          {voiceStatus === 'listening' && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
              <span className="absolute -inset-4 rounded-full bg-red-300 animate-ping opacity-20" 
                    style={{ animationDelay: '0.3s' }} />
            </>
          )}
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {voiceStatus === 'listening' 
            ? 'กำลังฟัง... กดเพื่อหยุด' 
            : 'กดเพื่อเริ่มพูด'}
        </p>
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 min-h-[80px]">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
            ข้อความที่ได้ยิน:
          </p>
          <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
            {transcript}
            <span className="text-gray-400 italic">{interimTranscript}</span>
          </p>
        </div>
      )}

      {/* Voice Error */}
      {voiceError && (
        <p className="text-red-500 text-sm text-center">{voiceError}</p>
      )}

      {/* Quick Examples */}
      {voiceStatus === 'idle' && status === 'idle' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 text-center uppercase tracking-wide">
            ตัวอย่างประโยค:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'กินก๋วยเตี๋ยว 50 กาแฟ 40',
              'จ่ายค่ารถไปทำงาน 20',
              'ได้เงินเดือน 15000',
              'ค่าไฟเดือนนี้ 800',
            ].map((example) => (
              <button
                key={example}
                onClick={() => handleProcessVoice(example)}
                className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 
                           text-blue-700 dark:text-blue-300 rounded-full
                           hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                &quot;{example}&quot;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={resetTranscript}
          disabled={!transcript && status === 'idle'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                     hover:bg-gray-300 dark:hover:bg-gray-600
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          รีเซ็ต
        </button>
        
        <button
          onClick={handleCancelLast}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300
                     hover:bg-red-200 dark:hover:bg-red-900/50
                     transition-colors text-sm"
        >
          <X className="w-4 h-4" />
          ยกเลิกรายการล่าสุด
        </button>
      </div>

      {/* Expense Confirmation Form */}
      {status === 'confirming' && currentTransaction && (
        <ExpenseForm
          transaction={currentTransaction}
          onConfirm={handleConfirm}
          onCancel={() => {
            setCurrentTransaction(null);
            setStatus('idle');
            resetTranscript();
          }}
        />
      )}
    </div>
  );
}