// src/components/ExpenseForm.tsx
'use client';

import { useState } from 'react';
import { ParsedTransaction, ExpenseItem } from '@/types/expense';
import { Check, X, Plus, Trash2 } from 'lucide-react';

interface ExpenseFormProps {
  transaction: ParsedTransaction;
  onConfirm: (tx: ParsedTransaction) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'อาหาร', 'เครื่องดื่ม', 'เดินทาง', 'ช้อปปิ้ง',
  'บันเทิง', 'สุขภาพ', 'การศึกษา', 'สาธารณูปโภค',
  'เงินเดือน', 'รายได้อื่น', 'อื่นๆ',
];

const inputBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  padding: '8px 12px',
  color: '#F0F4FF',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

export function ExpenseForm({ transaction, onConfirm, onCancel }: ExpenseFormProps) {
  const [editedTx, setEditedTx] = useState<ParsedTransaction>({
    ...transaction,
    items: transaction.items ?? [],
  });

  const updateItem = (index: number, updates: Partial<ExpenseItem>) => {
    const newItems = [...editedTx.items];
    newItems[index] = { ...newItems[index], ...updates };
    setEditedTx({ ...editedTx, items: newItems });
  };

  const removeItem = (index: number) =>
    setEditedTx({ ...editedTx, items: editedTx.items.filter((_, i) => i !== index) });

  const addItem = () =>
    setEditedTx({ ...editedTx, items: [...editedTx.items, { description: '', category: 'อื่นๆ', amount: 0, merchant: null }] });

  const totalAmount = (editedTx.items ?? []).reduce((s, i) => s + i.amount, 0);
  const isIncome = editedTx.type === 'income';
  const accentColor = isIncome ? '#10B981' : '#FF6B6B';
  const accentDim = isIncome ? 'rgba(16,185,129,0.12)' : 'rgba(255,107,107,0.12)';
  const accentBorder = isIncome ? 'rgba(16,185,129,0.25)' : 'rgba(255,107,107,0.25)';

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${accentBorder}`,
        boxShadow: `0 8px 32px ${accentDim}`,
      }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background: accentDim, borderBottom: `1px solid ${accentBorder}` }}>
        <div>
          <h3 className="font-bold text-sm" style={{ color: accentColor }}>
            {isIncome ? '💰 รายรับ' : '💸 รายจ่าย'}
          </h3>
          {transaction.originalText && (
            <p className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>
              &ldquo;{transaction.originalText}&rdquo;
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold" style={{ color: accentColor }}>
            ฿{totalAmount.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ยอดรวม</p>
        </div>
      </div>

      {/* Items list */}
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {(editedTx.items ?? []).map((item, index) => (
          <div key={index} className="p-3 rounded-xl space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <input type="text" value={item.description}
                onChange={e => updateItem(index, { description: e.target.value })}
                placeholder="ชื่อรายการ…"
                style={{ ...inputBase, flex: 1 }}
                onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <button onClick={() => removeItem(index)}
                disabled={editedTx.items.length === 1}
                style={{ color: '#FF6B6B', opacity: editedTx.items.length === 1 ? 0.3 : 1, flexShrink: 0 }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <select value={item.category}
                onChange={e => updateItem(index, { category: e.target.value })}
                style={{ ...inputBase, flex: 1, cursor: 'pointer' }}>
                {CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background: '#0D1321' }}>{cat}</option>)}
              </select>
              <input type="number" value={item.amount}
                onChange={e => updateItem(index, { amount: Number(e.target.value) })}
                style={{ ...inputBase, width: '88px', textAlign: 'right' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className="px-4 pb-3">
        <button onClick={addItem}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ border: '1px dashed rgba(245,158,11,0.3)', color: 'rgba(245,158,11,0.7)', background: 'rgba(245,158,11,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; e.currentTarget.style.color = '#F59E0B'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.04)'; e.currentTarget.style.color = 'rgba(245,158,11,0.7)'; }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
        </button>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all btn-ghost"
          style={{ marginTop: '12px' }}>
          <X className="w-4 h-4" /> ยกเลิก
        </button>
        <button
          onClick={() => onConfirm(editedTx)}
          disabled={(editedTx.items ?? []).some(i => !i.description)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{
            marginTop: '12px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: '#0D1321',
            boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
            opacity: (editedTx.items ?? []).some(i => !i.description) ? 0.5 : 1,
          }}>
          <Check className="w-4 h-4" /> บันทึก
        </button>
      </div>
    </div>
  );
}