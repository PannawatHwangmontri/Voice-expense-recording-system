// src/components/Dashboard/CategoryPie.tsx
'use client';

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CategoryData {
  name: string;
  amount: number;
  color: string;
}

interface CategoryPieProps {
  readonly data: readonly CategoryData[];
}

const RADIAN = Math.PI / 180;

// Label บน Pie
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number;
  cy: number;
  midAngle?: number;
  innerRadius: number;
  outerRadius: number;
  percent?: number;
}) => {
  if (!percent || percent < 0.05 || midAngle === undefined) return null; // ไม่แสดงถ้าน้อยกว่า 5%
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CategoryPie({ data }: CategoryPieProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 
                      text-gray-400 dark:text-gray-600">
        <p>ยังไม่มีข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            innerRadius={40}
            dataKey="amount"
            strokeWidth={2}
            stroke="transparent"
          />
          <Tooltip
            formatter={(value: number | undefined) => [`฿${(value ?? 0).toLocaleString()}`, '']}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              fontSize: '13px',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Top Categories List */}
      <div className="space-y-2">
        {data
          .toSorted((a, b) => b.amount - a.amount)
          .slice(0, 5)
          .map((item, index) => {
            const total = data.reduce((s, d) => s + d.amount, 0);
            const percent = total > 0 ? (item.amount / total) * 100 : 0;

            return (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">
                  {index + 1}
                </span>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
                    ฿{item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}