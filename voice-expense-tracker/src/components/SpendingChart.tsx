// src/components/Dashboard/SpendingChart.tsx
'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyData {
  date: string;
  expense: number;
  income: number;
}

interface SpendingChartProps {
  data: DailyData[];
}

// Custom Tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 
                      dark:border-gray-700 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name === 'expense' ? 'รายจ่าย' : 'รายรับ'}:{' '}
            <span className="font-bold">฿{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SpendingChart({ data }: SpendingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 
                      text-gray-400 dark:text-gray-600">
        <p>ยังไม่มีข้อมูล</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
        
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
        />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => value === 'expense' ? 'รายจ่าย' : 'รายรับ'}
          wrapperStyle={{ fontSize: '13px' }}
        />

        <Area
          type="monotone"
          dataKey="income"
          stroke="#22c55e"
          strokeWidth={2.5}
          fill="url(#colorIncome)"
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="url(#colorExpense)"
          dot={false}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}