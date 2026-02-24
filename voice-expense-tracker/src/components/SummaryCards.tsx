// src/components/Dashboard/SummaryCards.tsx
'use client';

import { TrendingDown, TrendingUp, Wallet, AlertCircle } from 'lucide-react';

interface SummaryCardsProps {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  budgetWarning?: boolean;
}

export function SummaryCards({
  totalExpense,
  totalIncome,
  balance,
  budgetWarning,
}: SummaryCardsProps) {
  const cards = [
    {
      label: 'รายรับทั้งหมด',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      prefix: '+',
    },
    {
      label: 'รายจ่ายทั้งหมด',
      value: totalExpense,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      prefix: '-',
    },
    {
      label: 'คงเหลือ',
      value: balance,
      icon: balance >= 0 ? Wallet : AlertCircle,
      color: balance >= 0
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-orange-600 dark:text-orange-400',
      bg: balance >= 0
        ? 'bg-blue-50 dark:bg-blue-900/20'
        : 'bg-orange-50 dark:bg-orange-900/20',
      border: balance >= 0
        ? 'border-blue-200 dark:border-blue-800'
        : 'border-orange-200 dark:border-orange-800',
      prefix: '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`
              rounded-2xl p-5 border
              ${card.bg} ${card.border}
              shadow-sm
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {card.label}
              </p>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>
              {card.prefix}฿{Math.abs(card.value).toLocaleString()}
            </p>
          </div>
        );
      })}

      {/* Budget Warning Banner */}
      {budgetWarning && (
        <div className="sm:col-span-3 flex items-center gap-3 
                        bg-yellow-50 dark:bg-yellow-900/20 
                        border border-yellow-300 dark:border-yellow-700
                        rounded-2xl px-5 py-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
            ⚠️ รายจ่ายเดือนนี้เกิน 80% ของรายรับแล้ว ควรระวังการใช้จ่าย
          </p>
        </div>
      )}
    </div>
  );
}