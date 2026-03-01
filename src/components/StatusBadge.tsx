// src/components/StatusBadge.tsx
'use client';

import { Status } from '@/types/expense';

const CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; dot?: string; pulse?: boolean }> = {
  idle: {
    label: 'พร้อมใช้งาน', color: 'var(--text-secondary)',
    bg: 'rgba(255,255,255,0.04)', border: 'var(--border)',
  },
  listening: {
    label: '🎙 กำลังฟัง…', color: '#FF6B6B',
    bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)',
    dot: '#FF6B6B', pulse: true,
  },
  processing: {
    label: '⚡ ประมวลผล…', color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',
    dot: '#F59E0B', pulse: true,
  },
  confirming: {
    label: '📋 ยืนยันรายการ', color: '#6366F1',
    bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)',
    dot: '#6366F1',
  },
  saved: {
    label: '✅ บันทึกแล้ว', color: '#10B981',
    bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',
    dot: '#10B981',
  },
  error: {
    label: '❌ เกิดข้อผิดพลาด', color: '#FF6B6B',
    bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)',
    dot: '#FF6B6B',
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = CONFIG[status] ?? CONFIG.idle;
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
      >
        {cfg.dot && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: cfg.dot,
              boxShadow: `0 0 6px ${cfg.dot}`,
              animation: cfg.pulse ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
        )}
        {cfg.label}
      </div>
    </div>
  );
}