// src/components/TransactionTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { LedgerEntry, FilterType } from '@/types/expense';
import { RefreshCw, TrendingUp, TrendingDown, Inbox, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { deleteEntry } from '@/lib/api';

interface TransactionTableProps {
    entries: LedgerEntry[];
    isLoading: boolean;
    onRefresh: () => void;
    isLocal?: boolean;
}

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
    อาหาร: { bg: 'rgba(249, 115, 22, 0.15)', color: '#fb923c' },
    เครื่องดื่ม: { bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' },
    เดินทาง: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
    ช้อปปิ้ง: { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' },
    บันเทิง: { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' },
    สุขภาพ: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' },
    การศึกษา: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
    เงินเดือน: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' },
    รายได้: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' },
};

function getCategoryStyle(cat: string) {
    return CATEGORY_STYLES[cat] ?? { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' };
}

function formatDate(dateStr: string) {
    try {
        return format(parseISO(dateStr), 'dd MMM', { locale: th });
    } catch {
        return dateStr?.slice(0, 10) ?? '';
    }
}

function formatTime(dateStr: string) {
    try {
        return format(parseISO(dateStr), 'HH:mm');
    } catch {
        return '';
    }
}

export function TransactionTable({ entries, isLoading, onRefresh, isLocal }: TransactionTableProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const filtered = useMemo(
        () => (filter === 'all' ? entries : entries.filter((e) => e.type === filter)),
        [entries, filter]
    );

    const filters: { label: string; value: FilterType }[] = [
        { label: 'ทั้งหมด', value: 'all' },
        { label: 'รายรับ', value: 'income' },
        { label: 'รายจ่าย', value: 'expense' },
    ];

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteEntry(id);
            setConfirmId(null);
            onRefresh(); // รีโหลดรายการหลังลบสำเร็จ
        } catch (err) {
            console.error('Delete failed:', err);
            alert('เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="glass rounded-3xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }} />
                        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            รายการธุรกรรม
                        </h2>
                    </div>
                    {isLocal && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            📱 Local
                        </span>
                    )}
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'โหลด...' : 'รีเฟรช'}
                </button>
            </div>

            {/* Filter tabs */}
            <div className="px-5 py-3 flex gap-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                {filters.map(({ label, value }) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={filter === value ? {
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: '#a78bfa',
                            border: '1px solid rgba(139, 92, 246, 0.4)',
                        } : {
                            background: 'rgba(255,255,255,0.03)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        {value === 'income' ? '↑ ' : value === 'expense' ? '↓ ' : ''}{label}
                    </button>
                ))}
                <span className="ml-auto self-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {filtered.length} รายการ
                </span>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#8b5cf6' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>กำลังโหลดข้อมูล...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <Inbox className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>ยังไม่มีรายการ</p>
                    <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>ลองบันทึกด้วยเสียงด้านบน</p>
                </div>
            ) : (
                <div className="divide-y divide-transparent">
                    {filtered.map((entry, idx) => {
                        const catStyle = getCategoryStyle(entry.category);
                        const isIncome = entry.type === 'income';
                        const isConfirming = confirmId === entry.id;
                        const isDeleting = deletingId === entry.id;

                        return (
                            <div
                                key={`${entry.id ?? 'entry'}_${idx}`}
                                className="px-5 py-3.5 flex items-center gap-3 transition-all group"
                                style={{
                                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                    cursor: 'default',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                {/* Type icon */}
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                                        border: `1px solid ${isIncome ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                                    }}
                                >
                                    {isIncome
                                        ? <TrendingUp className="w-4 h-4" style={{ color: '#34d399' }} />
                                        : <TrendingDown className="w-4 h-4" style={{ color: '#fb7185' }} />
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                        {entry.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span
                                            className="text-xs px-1.5 py-0.5 rounded-md"
                                            style={{ background: catStyle.bg, color: catStyle.color }}
                                        >
                                            {entry.category}
                                        </span>
                                        <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
                                            {formatDate(entry.date)} {formatTime(entry.date)}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount + Delete */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <p
                                        className="font-bold text-sm"
                                        style={{ color: isIncome ? '#34d399' : '#fb7185' }}
                                    >
                                        {isIncome ? '+' : '-'}฿{entry.amount.toLocaleString('th-TH')}
                                    </p>

                                    {/* Delete button / Confirm */}
                                    {isConfirming ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                disabled={isDeleting}
                                                className="text-xs px-2 py-1 rounded-lg font-medium transition-all"
                                                style={{
                                                    background: 'rgba(244, 63, 94, 0.2)',
                                                    color: '#fb7185',
                                                    border: '1px solid rgba(244, 63, 94, 0.4)',
                                                    opacity: isDeleting ? 0.5 : 1,
                                                }}
                                            >
                                                {isDeleting ? '...' : 'ลบ'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmId(null)}
                                                disabled={isDeleting}
                                                className="text-xs px-2 py-1 rounded-lg font-medium transition-all"
                                                style={{
                                                    background: 'rgba(148, 163, 184, 0.1)',
                                                    color: 'var(--text-secondary)',
                                                    border: '1px solid var(--border)',
                                                }}
                                            >
                                                ยกเลิก
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmId(entry.id)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                            style={{
                                                background: 'rgba(244, 63, 94, 0.1)',
                                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                                color: '#fb7185',
                                            }}
                                            title="ลบรายการ"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
