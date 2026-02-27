// src/components/SummaryBar.tsx
'use client';

import { SummaryData } from '@/types/expense';

interface SummaryBarProps {
    summary: SummaryData;
}

export function SummaryBar({ summary }: SummaryBarProps) {
    const cards = [
        {
            label: 'รายรับ',
            value: summary.totalIncome,
            icon: '↑',
            gradient: 'linear-gradient(135deg, #059669, #10b981)',
            glow: 'rgba(16, 185, 129, 0.25)',
            textColor: '#34d399',
            bg: 'rgba(16, 185, 129, 0.08)',
            border: 'rgba(16, 185, 129, 0.2)',
        },
        {
            label: 'รายจ่าย',
            value: summary.totalExpense,
            icon: '↓',
            gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
            glow: 'rgba(244, 63, 94, 0.25)',
            textColor: '#fb7185',
            bg: 'rgba(244, 63, 94, 0.08)',
            border: 'rgba(244, 63, 94, 0.2)',
        },
        {
            label: 'คงเหลือ',
            value: summary.balance,
            icon: summary.balance >= 0 ? '=' : '!',
            gradient: summary.balance >= 0
                ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                : 'linear-gradient(135deg, #d97706, #f59e0b)',
            glow: summary.balance >= 0 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(245, 158, 11, 0.25)',
            textColor: summary.balance >= 0 ? '#60a5fa' : '#fbbf24',
            bg: summary.balance >= 0 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: summary.balance >= 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="relative rounded-2xl p-4 overflow-hidden"
                    style={{
                        background: card.bg,
                        border: `1px solid ${card.border}`,
                        boxShadow: `0 4px 24px ${card.glow}`,
                    }}
                >
                    {/* Background glow blob */}
                    <div
                        className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-30"
                        style={{ background: card.gradient, filter: 'blur(16px)' }}
                    />

                    <div className="relative">
                        {/* Icon badge */}
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center mb-2 text-xs font-bold text-white"
                            style={{ background: card.gradient }}
                        >
                            {card.icon}
                        </div>

                        <p className="text-xs mb-1" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                            {card.label}
                        </p>
                        <p className="font-bold text-base leading-tight" style={{ color: card.textColor }}>
                            ฿{Math.abs(card.value).toLocaleString('th-TH')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
