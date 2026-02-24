// src/components/StatusBadge.tsx
'use client';

import { Status } from '@/types/expense';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  idle: { 
    label: 'พร้อมใช้งาน', 
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    pulse: false
  },
  listening: { 
    label: '🎙️ กำลังฟัง...', 
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    pulse: true
  },
  processing: { 
    label: '⚙️ กำลังประมวลผล...', 
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    pulse: true
  },
  confirming: { 
    label: '❓ รอการยืนยัน', 
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    pulse: false
  },
  saved: { 
    label: '✅ บันทึกแล้ว', 
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pulse: false
  },
  error: { 
    label: '❌ เกิดข้อผิดพลาด', 
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    pulse: false
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-center">
      <span
        className={clsx(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
          config.className,
          config.pulse && 'animate-pulse'
        )}
      >
        {config.label}
      </span>
    </div>
  );
}