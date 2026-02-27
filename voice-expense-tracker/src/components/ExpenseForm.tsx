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

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  padding: '8px 12px',
  color: '#f1f5f9',
  fontSize: '13px',
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
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

  const removeItem = (index: number) => {
    setEditedTx({ ...editedTx, items: editedTx.items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    setEditedTx({ ...editedTx, items: [...editedTx.items, { description: '', category: 'อื่นๆ', amount: 0, merchant: null }] });
  };

  const totalAmount = (editedTx.items ?? []).reduce((s, i) => s + i.amount, 0);
  const isIncome = editedTx.type === 'income';

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: 'rgba(17, 24, 39, 0.9)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: isIncome
        ? '0 0 30px rgba(16, 185, 129, 0.15)'
        : '0 0 30px rgba(244, 63, 94, 0.15)',
    }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{
        background: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div>
          <h3 className="font-bold" style={{ color: isIncome ? '#34d399' : '#fb7185' }}>
            {isIncome ? '💰 รายรับ' : '💸 รายจ่าย'}
          </h3>
          {transaction.originalText && (
            <p className="text-xs mt-0.5 truncate max-w-[200px]" style={{ color: 'rgba(148,163,184,0.7)' }}>
              &ldquo;{transaction.originalText}&rdquo;
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: isIncome ? '#34d399' : '#fb7185' }}>
            ฿{totalAmount.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>รวม</p>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
        {(editedTx.items ?? []).map((item, index) => (
          <div key={index} className="p-3 rounded-xl space-y-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                placeholder="รายการ..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => removeItem(index)}
                disabled={editedTx.items.length === 1}
                style={{ color: '#f43f5e', opacity: editedTx.items.length === 1 ? 0.3 : 1 }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={item.category}
                onChange={(e) => updateItem(index, { category: e.target.value })}
                style={{ ...selectStyle, flex: 1 }}
              >
                {CATEGORIES.map((cat) => <option key={cat} value={cat} style={{ background: '#111827' }}>{cat}</option>)}
              </select>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => updateItem(index, { amount: Number(e.target.value) })}
                style={{ ...inputStyle, width: '90px', textAlign: 'right' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add item button */}
      <div className="px-4 pb-3">
        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs transition-all"
          style={{
            border: '1px dashed rgba(139, 92, 246, 0.3)',
            color: '#a78bfa',
            background: 'rgba(139, 92, 246, 0.05)',
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
        </button>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          <X className="w-4 h-4" /> ยกเลิก
        </button>
        <button
          onClick={() => onConfirm(editedTx)}
          disabled={(editedTx.items ?? []).length === 0 || (editedTx.items ?? []).some(i => !i.description)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
            opacity: (editedTx.items ?? []).some(i => !i.description) ? 0.5 : 1,
          }}
        >
          <Check className="w-4 h-4" /> บันทึก
        </button>
      </div>
    </div>
  );
}