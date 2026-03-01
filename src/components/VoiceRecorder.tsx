// src/components/VoiceRecorder.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, RotateCcw, Sparkles, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { processVoiceText } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { ExpenseForm } from './ExpenseForm';

interface VoiceRecorderProps { onSaved?: () => void; }

const EXAMPLES = [
  'กินก๋วยเตี๋ยว 50 กาแฟ 40',
  'จ่ายค่ารถ 20 บาท',
  'ได้เงินเดือน 15000',
  'ค่าไฟเดือนนี้ 800',
];

type InputMode = 'voice' | 'chat';

export function VoiceRecorder({ onSaved }: VoiceRecorderProps) {
  const [language, setLanguage] = useState<'th-TH' | 'en-US'>('th-TH');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [chatText, setChatText] = useState('');
  const chatInputRef = useRef<HTMLInputElement>(null);

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
      const response = await processVoiceText({
        text: text.trim(),
        user_id: 'anonymous',
        timestamp: new Date().toISOString(),
      });
      if (response.success && response.data) {
        const raw = response.data as unknown as Record<string, unknown>;
        const items = Array.isArray(raw.items) && raw.items.length > 0
          ? raw.items
          : [{ description: (raw.description as string) || text.trim(), amount: Number(raw.amount) || 0, category: (raw.category as string) || 'อื่นๆ', merchant: null }];
        setCurrentTransaction({ ...response.data, items });
        setStatus('confirming');
      } else if (response.isCommand) {
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

  const handleChatSend = async () => {
    const text = chatText.trim();
    if (!text) return;
    setChatText('');
    await handleProcessVoice(text);
  };

  const handleConfirm = (transaction: typeof currentTransaction) => {
    if (!transaction) return;
    addTransaction(transaction);
    setStatus('saved');
    resetTranscript();
    toast.success(`บันทึก ${transaction.items.length} รายการแล้ว ✅`);
    setTimeout(() => { setStatus('idle'); onSaved?.(); }, 1500);
  };

  const isListening = voiceStatus === 'listening';
  const isProcessing = status === 'processing';
  const isConfirming = status === 'confirming';

  return (
    <div className="space-y-5">

      {/* ── Mode Tabs ── */}
      <div className="flex rounded-xl p-1 gap-1"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
        {([
          { mode: 'voice' as InputMode, icon: <Mic className="w-3.5 h-3.5" />, label: 'เสียง' },
          { mode: 'chat' as InputMode, icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'แชท' },
        ]).map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all"
            style={inputMode === mode ? {
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#0D1321',
              boxShadow: '0 2px 12px rgba(245,158,11,0.3)',
            } : {
              background: 'transparent',
              color: 'var(--text-secondary)',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <StatusBadge status={status === 'idle' ? voiceStatus : status} />

      {/* ── VOICE MODE ── */}
      {inputMode === 'voice' && (
        <>
          {!isSupported ? (
            <div className="text-center p-5 rounded-2xl"
              style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
              <p className="font-semibold" style={{ color: '#FF6B6B' }}>⚠️ ไม่รองรับ Voice Recognition</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>ลองใช้แชทแทนได้ครับ</p>
            </div>
          ) : (
            <>
              {/* Language toggle */}
              <div className="flex justify-center gap-2">
                {(['th-TH', 'en-US'] as const).map((lang) => (
                  <button key={lang} onClick={() => setLanguage(lang)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={language === lang ? {
                      background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)',
                    } : {
                      background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                    }}>
                    {lang === 'th-TH' ? '🇹🇭 ไทย' : '🇬🇧 EN'}
                  </button>
                ))}
              </div>

              {/* Mic button */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,107,107,0.15)', transform: 'scale(1.6)', animation: 'ping-gold 1.5s ease-out infinite' }} />
                      <span className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,107,107,0.08)', transform: 'scale(2)', animation: 'ping-gold 1.5s ease-out 0.4s infinite' }} />
                    </>
                  )}
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing || isConfirming}
                    className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isListening ? 'linear-gradient(135deg, #FF6B6B, #e11d48)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
                      boxShadow: isListening
                        ? '0 0 0 4px rgba(255,107,107,0.2), 0 8px 32px rgba(255,107,107,0.4)'
                        : '0 0 0 4px rgba(245,158,11,0.15), 0 8px 32px rgba(245,158,11,0.35)',
                      opacity: isProcessing || isConfirming ? 0.5 : 1,
                      transform: isListening ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {isListening ? <MicOff className="w-9 h-9 text-white" /> : <Mic className="w-9 h-9" style={{ color: '#0D1321' }} />}
                  </button>
                </div>

                {/* Wave bars */}
                {isListening && (
                  <div className="flex items-center gap-1" style={{ color: '#FF6B6B', height: '24px' }}>
                    {[0, 0.1, 0.2, 0.15, 0.05, 0.2, 0.1, 0.25, 0.05, 0.15].map((delay, i) => (
                      <span key={i} className="wave-bar" style={{ height: `${12 + (i % 3) * 6}px`, animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                )}
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {isListening ? 'กำลังฟัง… กดอีกครั้งเพื่อหยุด' : isProcessing ? 'กำลังประมวลผล…' : 'กดเพื่อเริ่มพูด'}
                </p>
              </div>

              {/* Transcript */}
              {(transcript || interimTranscript) && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs mb-2 font-semibold uppercase tracking-widest" style={{ color: 'rgba(245,158,11,0.6)' }}>ข้อความที่ได้ยิน</p>
                  <p style={{ color: 'var(--text-primary)' }}>
                    {transcript}
                    <span className="italic" style={{ color: 'var(--text-secondary)' }}>{interimTranscript}</span>
                  </p>
                </div>
              )}
              {voiceError && <p className="text-sm text-center" style={{ color: '#FF6B6B' }}>{voiceError}</p>}
            </>
          )}
        </>
      )}

      {/* ── CHAT MODE ── */}
      {inputMode === 'chat' && (
        <div className="space-y-4">
          {/* Chat hint */}
          <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <p className="font-semibold mb-1" style={{ color: '#F59E0B' }}>💬 พิมพ์รายการได้เลย</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              พิมพ์ข้อความเหมือนพูด เช่น &quot;กินข้าว 60 กาแฟ 35&quot; หรือ &quot;ได้เงินเดือน 20000&quot;
            </p>
          </div>

          {/* Input box */}
          <div className="flex gap-2">
            <input
              ref={chatInputRef}
              type="text"
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
              placeholder="พิมพ์รายการรายรับ-รายจ่าย…"
              disabled={isProcessing || isConfirming}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(245,158,11,0.2)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit',
                opacity: isProcessing || isConfirming ? 0.6 : 1,
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(245,158,11,0.2)')}
              autoFocus
            />
            <button
              onClick={handleChatSend}
              disabled={!chatText.trim() || isProcessing || isConfirming}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: chatText.trim() ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255,255,255,0.05)',
                color: chatText.trim() ? '#0D1321' : 'var(--text-secondary)',
                border: chatText.trim() ? 'none' : '1px solid var(--border)',
                boxShadow: chatText.trim() ? '0 4px 16px rgba(245,158,11,0.3)' : 'none',
                opacity: isProcessing || isConfirming ? 0.5 : 1,
              }}
            >
              {isProcessing ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Quick Examples (both modes when idle) ── */}
      {voiceStatus === 'idle' && status === 'idle' && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>ตัวอย่าง</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  if (inputMode === 'chat') {
                    setChatText(ex);
                    chatInputRef.current?.focus();
                  } else {
                    handleProcessVoice(ex);
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-xl transition-all font-medium"
                style={{ background: 'rgba(245,158,11,0.06)', color: 'rgba(245,158,11,0.7)', border: '1px solid rgba(245,158,11,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.color = '#F59E0B'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.color = 'rgba(245,158,11,0.7)'; }}
              >
                &ldquo;{ex}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Action buttons (voice mode) ── */}
      {inputMode === 'voice' && (
        <div className="flex gap-2 justify-center">
          <button onClick={resetTranscript} disabled={!transcript && status === 'idle'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all btn-ghost">
            <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ต
          </button>
          <button
            onClick={() => { setCurrentTransaction(null); setStatus('idle'); resetTranscript(); }}
            disabled={status === 'idle' && !currentTransaction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,107,107,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
            <X className="w-3.5 h-3.5" /> ยกเลิก
          </button>
        </div>
      )}

      {/* ── Confirm form ── */}
      {status === 'confirming' && currentTransaction && (
        <ExpenseForm
          transaction={currentTransaction}
          onConfirm={handleConfirm}
          onCancel={() => { setCurrentTransaction(null); setStatus('idle'); resetTranscript(); setChatText(''); }}
        />
      )}
    </div>
  );
}