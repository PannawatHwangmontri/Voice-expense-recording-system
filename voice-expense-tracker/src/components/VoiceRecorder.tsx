// src/components/VoiceRecorder.tsx
'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, X, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { processVoiceText } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { ExpenseForm } from './ExpenseForm';

interface VoiceRecorderProps {
  onSaved?: () => void;
}

export function VoiceRecorder({ onSaved }: VoiceRecorderProps) {
  const [language, setLanguage] = useState<'th-TH' | 'en-US'>('th-TH');

  const {
    transcript, interimTranscript, status: voiceStatus,
    isSupported, startListening, stopListening, resetTranscript, error: voiceError,
  } = useVoiceRecognition(language);

  const { currentTransaction, status, setCurrentTransaction, setStatus, addTransaction } =
    useExpenseStore();

  useEffect(() => {
    if (voiceStatus === 'processing' && transcript) handleProcessVoice(transcript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceStatus, transcript]);

  const handleProcessVoice = async (text: string) => {
    if (!text.trim()) { setStatus('idle'); return; }
    setStatus('processing');
    try {
      const response = await processVoiceText({ text: text.trim(), user_id: 'anonymous', timestamp: new Date().toISOString() });
      if (response.success && response.data) {
        const raw = response.data as unknown as Record<string, unknown>;
        const items = Array.isArray(raw.items) && raw.items.length > 0
          ? raw.items
          : [{ description: (raw.description as string) || text.trim(), amount: Number(raw.amount) || 0, category: (raw.category as string) || 'อื่นๆ', merchant: null }];
        setCurrentTransaction({ ...response.data, items });
        setStatus('confirming');
      } else if (response.isCommand) {
        // Build Command Response1: ตอบกลับคำสั่งเช่น "สรุป", "วันนี้ใช้เท่าไหร่"
        toast(response.message || 'ดำเนินคำสั่งแล้ว', { icon: '🤖', duration: 6000 });
        setStatus('idle');
      } else if (response.requiresConfirmation) {
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

  const handleConfirm = (transaction: typeof currentTransaction) => {
    if (!transaction) return;
    addTransaction(transaction);
    setStatus('saved');
    resetTranscript();
    toast.success(`บันทึก ${transaction.items.length} รายการแล้ว ✅`);
    setTimeout(() => { setStatus('idle'); onSaved?.(); }, 1500);
  };

  if (!isSupported) {
    return (
      <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
        <p className="font-medium" style={{ color: '#fb7185' }}>⚠️ เบราว์เซอร์ไม่รองรับ Voice Recognition</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>กรุณาใช้ Chrome หรือ Edge</p>
      </div>
    );
  }

  const isListening = voiceStatus === 'listening';
  const isProcessing = status === 'processing';

  const EXAMPLES = ['กินก๋วยเตี๋ยว 50 กาแฟ 40', 'จ่ายค่ารถ 20 บาท', 'ได้เงินเดือน 15000', 'ค่าไฟเดือนนี้ 800'];

  return (
    <div className="space-y-5">
      <StatusBadge status={status === 'idle' ? voiceStatus : status} />

      {/* Language toggle */}
      <div className="flex justify-center gap-2">
        {(['th-TH', 'en-US'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className="px-3 py-1 rounded-xl text-xs font-medium transition-all"
            style={language === lang ? {
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.4)',
            } : {
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {lang === 'th-TH' ? '🇹🇭 ไทย' : '🇬🇧 EN'}
          </button>
        ))}
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing || status === 'confirming'}
          className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isListening
              ? 'linear-gradient(135deg, #e11d48, #f43f5e)'
              : 'linear-gradient(135deg, #2563eb, #3b82f6)',
            boxShadow: isListening
              ? '0 0 40px rgba(244, 63, 94, 0.4), 0 8px 32px rgba(244, 63, 94, 0.3)'
              : '0 0 40px rgba(59, 130, 246, 0.3), 0 8px 32px rgba(59, 130, 246, 0.2)',
            opacity: isProcessing || status === 'confirming' ? 0.5 : 1,
            transform: 'scale(1)',
          }}
          aria-label={isListening ? 'หยุดอัดเสียง' : 'เริ่มอัดเสียง'}
        >
          {isListening ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-20" />
              <span className="absolute -inset-3 rounded-full bg-rose-400 animate-ping opacity-10" style={{ animationDelay: '0.3s' }} />
            </>
          )}
        </button>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {isListening ? 'กำลังฟัง… กดเพื่อหยุด' : isProcessing ? 'กำลังประมวลผล…' : 'กดเพื่อเริ่มพูด'}
        </p>
      </div>

      {/* Transcript box */}
      {(transcript || interimTranscript) && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <p className="text-xs mb-1.5 font-medium uppercase tracking-wide" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
            ข้อความที่ได้ยิน
          </p>
          <p style={{ color: 'var(--text-primary)' }}>
            {transcript}
            <span className="italic" style={{ color: 'var(--text-secondary)' }}>{interimTranscript}</span>
          </p>
        </div>
      )}

      {voiceError && <p className="text-sm text-center" style={{ color: '#fb7185' }}>{voiceError}</p>}

      {/* Quick examples */}
      {voiceStatus === 'idle' && status === 'idle' && (
        <div className="space-y-2">
          <p className="text-xs text-center uppercase tracking-wide" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
            ตัวอย่าง
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => handleProcessVoice(ex)}
                className="text-xs px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'; }}
              >
                &ldquo;{ex}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={resetTranscript}
          disabled={!transcript && status === 'idle'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ต
        </button>
        <button
          onClick={() => { setCurrentTransaction(null); setStatus('idle'); resetTranscript(); }}
          disabled={status === 'idle' && !currentTransaction}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all"
          style={{
            background: 'rgba(244, 63, 94, 0.08)',
            color: '#fb7185',
            border: '1px solid rgba(244, 63, 94, 0.2)',
          }}
        >
          <X className="w-3.5 h-3.5" /> ยกเลิก
        </button>
      </div>

      {/* Confirm form */}
      {status === 'confirming' && currentTransaction && (
        <ExpenseForm
          transaction={currentTransaction}
          onConfirm={handleConfirm}
          onCancel={() => { setCurrentTransaction(null); setStatus('idle'); resetTranscript(); }}
        />
      )}
    </div>
  );
}