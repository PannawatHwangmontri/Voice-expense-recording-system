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

const CATEGORY_COLORS: Record<string, string> = {
    อาหาร: '#F59E0B', เครื่องดื่ม: '#06B6D4', เดินทาง: '#6366F1',
    ช้อปปิ้ง: '#EC4899', บันเทิง: '#8B5CF6', สุขภาพ: '#10B981',
    การศึกษา: '#F59E0B', เงินเดือน: '#10B981', รายได้: '#10B981',
};

function getCategoryColor(cat: string) {
    return CATEGORY_COLORS[cat] ?? '#8B95B0';
}

function formatDate(d: string) {
    try { return format(parseISO(d), 'dd MMM yy', { locale: th }); } catch { return d?.slice(0, 10) ?? ''; }
}
function formatTime(d: string) {
    try { return format(parseISO(d), 'HH:mm'); } catch { return ''; }
}

export function TransactionTable({ entries, isLoading, onRefresh, isLocal }: TransactionTableProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const filtered = useMemo(
        () => filter === 'all' ? entries : entries.filter(e => e.type === filter),
        [entries, filter]
    );

    const filters: { label: string; value: FilterType; color: string }[] = [
        { label: 'ทั้งหมด', value: 'all', color: '#F59E0B' },
        { label: '↑ รายรับ', value: 'income', color: '#10B981' },
        { label: '↓ รายจ่าย', value: 'expense', color: '#FF6B6B' },
    ];

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteEntry(id);
            setConfirmId(null);
            onRefresh();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('เกิดข้อผิดพลาดในการลบ');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>

            {/* Header */}
            <div className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #10B981, #059669)' }} />
                    <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>รายการธุรกรรม</h2>
                    {isLocal && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                            Local
                        </span>
                    )}
                </div>
                <button onClick={onRefresh} disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'โหลด…' : 'รีเฟรช'}
                </button>
            </div>

            {/* Filter tabs */}
            <div className="px-5 py-2.5 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
                {filters.map(({ label, value, color }) => (
                    <button key={value} onClick={() => setFilter(value)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={filter === value ? {
                            background: `${color}18`,
                            color: color,
                            border: `1px solid ${color}40`,
                        } : {
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid transparent',
                        }}>
                        {label}
                    </button>
                ))}
                <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                    {filtered.length} รายการ
                </span>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#F59E0B' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>กำลังโหลดข้อมูล…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <Inbox className="w-6 h-6" style={{ color: '#F59E0B' }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>ยังไม่มีรายการ</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ลองบันทึกด้วยเสียงด้านบน</p>
                </div>
            ) : (
                <div>
                    {filtered.map((entry, idx) => {
                        const isIncome = entry.type === 'income';
                        const catColor = getCategoryColor(entry.category);
                        const isConfirming = confirmId === entry.id;
                        const isDeleting = deletingId === entry.id;

                        return (
                            <div key={`${entry.id ?? 'e'}_${idx}`}
                                className="flex items-center gap-3.5 px-5 py-3.5 transition-all group relative"
                                style={{
                                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                {/* Left color bar */}
                                <div className="w-0.5 self-stretch rounded-full flex-shrink-0"
                                    style={{ background: isIncome ? '#10B981' : '#FF6B6B', opacity: 0.7 }} />

                                {/* Icon */}
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: isIncome ? 'rgba(16,185,129,0.12)' : 'rgba(255,107,107,0.12)',
                                        border: `1px solid ${isIncome ? 'rgba(16,185,129,0.2)' : 'rgba(255,107,107,0.2)'}`,
                                    }}>
                                    {isIncome
                                        ? <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
                                        : <TrendingDown className="w-4 h-4" style={{ color: '#FF6B6B' }} />
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                        {entry.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                            style={{ background: `${catColor}18`, color: catColor }}>
                                            {entry.category}
                                        </span>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {formatDate(entry.date)} {formatTime(entry.date)}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount + Delete */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <p className="font-bold text-sm" style={{ color: isIncome ? '#10B981' : '#FF6B6B' }}>
                                        {isIncome ? '+' : '-'}฿{entry.amount.toLocaleString('th-TH')}
                                    </p>

                                    {isConfirming ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleDelete(entry.id)} disabled={isDeleting}
                                                className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
                                                style={{
                                                    background: 'rgba(255,107,107,0.15)',
                                                    color: '#FF6B6B',
                                                    border: '1px solid rgba(255,107,107,0.35)',
                                                    opacity: isDeleting ? 0.5 : 1,
                                                }}>
                                                {isDeleting ? '…' : 'ลบ'}
                                            </button>
                                            <button onClick={() => setConfirmId(null)} disabled={isDeleting}
                                                className="text-xs px-2.5 py-1 rounded-lg font-semibold btn-ghost">
                                                ยกเลิก
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setConfirmId(entry.id)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                            style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}
                                            title="ลบรายการ">
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
