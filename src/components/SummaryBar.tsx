// src/components/SummaryBar.tsx
'use client';

import { SummaryData } from '@/types/expense';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface Props { summary: SummaryData; }

function fmt(n: number) {
    return n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function SummaryBar({ summary }: Props) {
    const { totalIncome, totalExpense, balance } = summary;
    const balancePositive = balance >= 0;

    const cards = [
        {
            label: 'รายรับ',
            value: totalIncome,
            icon: TrendingUp,
            color: '#10B981',
            dimColor: 'rgba(16,185,129,0.12)',
            borderColor: 'rgba(16,185,129,0.2)',
            glowColor: 'rgba(16,185,129,0.15)',
            prefix: '+',
        },
        {
            label: 'รายจ่าย',
            value: totalExpense,
            icon: TrendingDown,
            color: '#FF6B6B',
            dimColor: 'rgba(255,107,107,0.12)',
            borderColor: 'rgba(255,107,107,0.2)',
            glowColor: 'rgba(255,107,107,0.15)',
            prefix: '-',
        },
        {
            label: 'คงเหลือ',
            value: Math.abs(balance),
            icon: Wallet,
            color: balancePositive ? '#F59E0B' : '#FF6B6B',
            dimColor: balancePositive ? 'rgba(245,158,11,0.12)' : 'rgba(255,107,107,0.12)',
            borderColor: balancePositive ? 'rgba(245,158,11,0.25)' : 'rgba(255,107,107,0.25)',
            glowColor: balancePositive ? 'rgba(245,158,11,0.12)' : 'rgba(255,107,107,0.12)',
            prefix: balancePositive ? '' : '-',
            highlight: true,
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {cards.map(({ label, value, icon: Icon, color, dimColor, borderColor, glowColor, prefix, highlight }) => (
                <div
                    key={label}
                    className="rounded-2xl p-4 flex flex-col gap-2 transition-all"
                    style={{
                        background: highlight
                            ? `linear-gradient(135deg, ${dimColor}, rgba(13,19,33,0.95))`
                            : 'var(--bg-card)',
                        border: `1px solid ${borderColor}`,
                        boxShadow: highlight ? `0 4px 24px ${glowColor}` : '0 4px 16px rgba(0,0,0,0.2)',
                    }}
                >
                    {/* Icon */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: dimColor }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>

                    {/* Amount */}
                    <div>
                        <p className="font-bold text-sm leading-tight" style={{ color }}>
                            {prefix}฿{fmt(value)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {label}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
