// src/app/page.tsx
'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { SummaryBar } from '@/components/SummaryBar';
import { TransactionTable } from '@/components/TransactionTable';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { fetchLedger } from '@/lib/api';
import { LedgerEntry } from '@/types/expense';

export default function HomePage() {
  const { ledger, localEntries, transactions, isLoadingLedger, setLedger, setLoadingLedger } =
    useExpenseStore();

  const loadLedger = useCallback(async () => {
    setLoadingLedger(true);
    try {
      const entries = await fetchLedger();
      setLedger(entries);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoadingLedger(false);
    }
  }, [setLedger, setLoadingLedger]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  // migration fallback: ถ้า localEntries ว่างแต่มี transactions เก่า
  const computedLocal = useMemo<LedgerEntry[]>(() => {
    if (localEntries.length > 0) return localEntries;
    return transactions.flatMap((tx, txIdx) =>
      (tx.items ?? []).map((item, itemIdx) => ({
        id: `local_${txIdx}_${itemIdx}`,
        date: tx.timestamp,
        type: tx.type,
        description: item.description,
        category: item.category || 'อื่นๆ',
        amount: item.amount,
        note: item.merchant || '',
      }))
    );
  }, [localEntries, transactions]);

  const displayEntries = useMemo<LedgerEntry[]>(() => {
    if (ledger.length > 0) return ledger;
    return computedLocal;
  }, [ledger, computedLocal]);

  const summary = useMemo(() => {
    const totalIncome = displayEntries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpense = displayEntries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [displayEntries]);

  const isLocal = ledger.length === 0 && computedLocal.length > 0;

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-base)', zIndex: 1 }}>
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b"
          style={{ borderColor: 'var(--border)', backdropFilter: 'blur(24px)' }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <span className="text-sm">📒</span>
              </div>
              <div>
                <h1 className="font-bold text-sm gradient-text">ระบบบัญชีรายรับ-รายจ่าย</h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Voice Expense Tracker</p>
              </div>
            </div>
            {isLocal && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                📱 ข้อมูลในเครื่อง
              </span>
            )}
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-12">
          {/* Summary Bar */}
          <SummaryBar summary={summary} />

          {/* Voice Recorder */}
          <div className="glass rounded-3xl p-6" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-blue-400" style={{ boxShadow: '0 0 8px #3b82f6' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                บันทึกด้วยเสียง
              </h2>
            </div>
            <VoiceRecorder onSaved={loadLedger} />
          </div>

          {/* Transaction Table */}
          <TransactionTable
            entries={displayEntries}
            isLoading={isLoadingLedger}
            onRefresh={loadLedger}
            isLocal={isLocal}
          />
        </main>
      </div>
    </div>
  );
}