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

  useEffect(() => { loadLedger(); }, [loadLedger]);

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
    const totalIncome = displayEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpense = displayEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [displayEntries]);

  const isLocal = ledger.length === 0 && computedLocal.length > 0;

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-base)', zIndex: 1 }}>
      {/* Content */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Header ── */}
        <header className="sticky top-0 z-50"
          style={{
            background: 'rgba(7, 11, 20, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.1)',
          }}>
          <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
                <span className="text-lg">💰</span>
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Money<span className="gradient-text-gold">Flow</span>
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>AI Expense Tracker</p>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2">
              {isLocal && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
                  📱 Local
                </span>
              )}
              <div className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--text-secondary)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px #10B981' }} />
                Live
              </div>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-16">

          {/* Summary Cards */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0ms' }}>
            <SummaryBar summary={summary} />
          </div>

          {/* Voice Recorder Section */}
          <div className="animate-fadeInUp" style={{ animationDelay: '80ms' }}>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              {/* Section header */}
              <div className="px-5 py-3.5 flex items-center gap-2.5"
                style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.04)' }}>
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #F59E0B, #D97706)' }} />
                <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>บันทึกด้วยเสียง</h2>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  AI Powered
                </span>
              </div>
              <div className="p-5">
                <VoiceRecorder onSaved={loadLedger} />
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="animate-fadeInUp" style={{ animationDelay: '160ms' }}>
            <TransactionTable
              entries={displayEntries}
              isLoading={isLoadingLedger}
              onRefresh={loadLedger}
              isLocal={isLocal}
            />
          </div>

        </main>
      </div>
    </div>
  );
}