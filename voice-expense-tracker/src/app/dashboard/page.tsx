// src/app/dashboard/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { CategoryPie } from '@/components/CategoryPie';
import { SummaryCards } from '@/components/SummaryCards';
import { SpendingChart } from '@/components/SpendingChart';
import { format, isThisMonth, isToday, isThisWeek, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft, Download, Calendar } from 'lucide-react';

// สีสำหรับหมวดหมู่
const CATEGORY_COLORS: Record<string, string> = {
  'อาหาร':          '#f97316',
  'เครื่องดื่ม':    '#06b6d4',
  'เดินทาง':        '#8b5cf6',
  'ช้อปปิ้ง':       '#ec4899',
  'ความบันเทิง':    '#f59e0b',
  'สุขภาพ':         '#10b981',
  'การศึกษา':       '#3b82f6',
  'สาธารณูปโภค':   '#6b7280',
  'เงินเดือน':      '#22c55e',
  'อื่นๆ':          '#94a3b8',
};

type Period = 'today' | 'week' | 'month' | 'all';

export default function DashboardPage() {
  const { transactions } = useExpenseStore();
  const [period, setPeriod] = useState<Period>('month');

  // ─── Filter ตาม Period ───────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const date = parseISO(tx.timestamp);
      if (period === 'today')  return isToday(date);
      if (period === 'week')   return isThisWeek(date, { weekStartsOn: 1 });
      if (period === 'month')  return isThisMonth(date);
      return true; // all
    });
  }, [transactions, period]);

  // ─── Summary Numbers ─────────────────────────────────────────
  const { totalExpense, totalIncome, balance } = useMemo(() => {
    let expense = 0;
    let income = 0;

    filtered.forEach((tx) => {
      const amount = tx.items.reduce((s, i) => s + i.amount, 0);
      if (tx.type === 'expense') expense += amount;
      else income += amount;
    });

    return {
      totalExpense: expense,
      totalIncome: income,
      balance: income - expense,
    };
  }, [filtered]);

  // ─── Category Breakdown (รายจ่ายเท่านั้น) ──────────────────
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};

    filtered
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        tx.items.forEach((item) => {
          map[item.category] = (map[item.category] || 0) + item.amount;
        });
      });

    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      color: CATEGORY_COLORS[name] || '#94a3b8',
    }));
  }, [filtered]);

  // ─── Daily Trend Chart ───────────────────────────────────────
  const dailyTrend = useMemo(() => {
    const map: Record<string, { expense: number; income: number }> = {};

    filtered.forEach((tx) => {
      const dateKey = format(parseISO(tx.timestamp), 'dd/MM', { locale: th });
      if (!map[dateKey]) map[dateKey] = { expense: 0, income: 0 };

      const amount = tx.items.reduce((s, i) => s + i.amount, 0);
      if (tx.type === 'expense') map[dateKey].expense += amount;
      else map[dateKey].income += amount;
    });

    return Object.entries(map)
      .map(([date, values]) => ({ date, ...values }))
      .slice(-14); // แสดง 14 วันล่าสุด
  }, [filtered]);

  // ─── Top Spending Items ──────────────────────────────────────
  const topItems = useMemo(() => {
    const items: { description: string; category: string; amount: number }[] = [];

    filtered
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        tx.items.forEach((item) => {
          items.push({
            description: item.description,
            category: item.category,
            amount: item.amount,
          });
        });
      });

    return items
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filtered]);

  // ─── Export CSV ──────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['วันที่', 'ประเภท', 'รายการ', 'หมวดหมู่', 'จำนวนเงิน', 'ร้าน'];
    const rows = filtered.flatMap((tx) =>
      tx.items.map((item) => [
        format(parseISO(tx.timestamp), 'dd/MM/yyyy HH:mm'),
        tx.type === 'expense' ? 'รายจ่าย' : 'รายรับ',
        item.description,
        item.category,
        item.amount,
        item.merchant || '',
      ])
    );

    const csv = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ─── Period Tabs Config ──────────────────────────────────────
  const periodTabs: { key: Period; label: string }[] = [
    { key: 'today', label: 'วันนี้' },
    { key: 'week',  label: 'สัปดาห์นี้' },
    { key: 'month', label: 'เดือนนี้' },
    { key: 'all',   label: 'ทั้งหมด' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 backdrop-blur-md 
                      bg-white/80 dark:bg-gray-900/80
                      border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 
                        flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-gray-100 
                         dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="font-bold text-lg text-gray-800 dark:text-white">
              📊 Dashboard
            </h1>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                       bg-blue-600 hover:bg-blue-700 text-white 
                       text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── Period Selector ── */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 
                        rounded-2xl p-1.5 shadow-sm border 
                        border-gray-200 dark:border-gray-700 w-fit">
          <Calendar className="w-4 h-4 text-gray-400 ml-2" />
          {periodTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`
                px-4 py-1.5 rounded-xl text-sm font-medium transition-all
                ${period === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Summary Cards ── */}
        <SummaryCards
          totalExpense={totalExpense}
          totalIncome={totalIncome}
          balance={balance}
          budgetWarning={totalIncome > 0 && totalExpense / totalIncome > 0.8}
        />

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 
                          shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
              📈 แนวโน้มรายรับ-รายจ่าย
            </h2>
            <SpendingChart data={dailyTrend} />
          </div>

          {/* Category Pie */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 
                          shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
              🍕 สัดส่วนรายจ่ายตามหมวด
            </h2>
            <CategoryPie data={categoryData} />
          </div>
        </div>

        {/* ── Top Spending ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 
                        shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
            🔥 รายการใช้จ่ายสูงสุด
          </h2>

          {topItems.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              ยังไม่มีรายการในช่วงเวลานี้
            </p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 
                             bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40
                                  flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.category}
                    </p>
                  </div>
                  <span className="font-bold text-red-500 dark:text-red-400 flex-shrink-0">
                    ฿{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── All Transactions ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 
                        shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📋 รายการทั้งหมด ({filtered.length} รายการ)
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-5xl">🎙️</p>
              <p className="text-gray-500 dark:text-gray-400">
                ยังไม่มีรายการ กลับไปอัดเสียงกันเถอะ!
              </p>
              <Link
                href="/"
                className="inline-block px-5 py-2 bg-blue-600 
                           hover:bg-blue-700 text-white rounded-xl
                           text-sm transition-colors"
              >
                เริ่มบันทึก →
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.map((tx, txIndex) => (
                <div
                  key={txIndex}
                  className="border border-gray-100 dark:border-gray-700 
                             rounded-xl overflow-hidden"
                >
                  {/* Transaction Header */}
                  <div className={`
                    px-4 py-2 flex items-center justify-between
                    ${tx.type === 'expense'
                      ? 'bg-red-50 dark:bg-red-900/10'
                      : 'bg-green-50 dark:bg-green-900/10'
                    }
                  `}>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {format(parseISO(tx.timestamp), 'dd MMM yyyy HH:mm', { locale: th })}
                    </span>
                    <span className={`text-sm font-bold ${
                      tx.type === 'expense'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {tx.type === 'expense' ? '-' : '+'}
                      ฿{tx.items.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-2 space-y-1">
                    {tx.items.map((item, itemIndex) => (
                      <div key={itemIndex}
                           className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: CATEGORY_COLORS[item.category] || '#94a3b8'
                            }}
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.description}
                          </span>
                          <span className="text-xs text-gray-400 px-1.5 py-0.5 
                                           bg-gray-100 dark:bg-gray-700 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          ฿{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}