// src/components/ExpenseForm.tsx
'use client';

import { useState } from 'react';
import { ParsedTransaction, ExpenseItem } from '@/types/expense';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ExpenseFormProps {
  transaction: ParsedTransaction;
  onConfirm: (tx: ParsedTransaction) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'อาหาร', 'เครื่องดื่ม', 'เดินทาง', 'ช้อปปิ้ง',
  'ความบันเทิง', 'สุขภาพ', 'การศึกษา', 'สาธารณูปโภค',
  'รายรับ', 'เงินเดือน', 'อื่นๆ',
];

export function ExpenseForm({ transaction, onConfirm, onCancel }: ExpenseFormProps) {
  const [editedTx, setEditedTx] = useState<ParsedTransaction>(transaction);

  const updateItem = (index: number, updates: Partial<ExpenseItem>) => {
    const newItems = [...editedTx.items];
    newItems[index] = { ...newItems[index], ...updates };
    setEditedTx({ ...editedTx, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = editedTx.items.filter((_, i) => i !== index);
    setEditedTx({ ...editedTx, items: newItems });
  };

  const addItem = () => {
    setEditedTx({
      ...editedTx,
      items: [
        ...editedTx.items,
        { description: '', category: 'อื่นๆ', amount: 0, merchant: null },
      ],
    });
  };

  const totalAmount = editedTx.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border 
                    border-gray-200 dark:border-gray-700 overflow-hidden">
      
      {/* Header */}
      <div className={clsx(
        'px-6 py-4 flex items-center justify-between',
        editedTx.type === 'expense' 
          ? 'bg-red-50 dark:bg-red-900/20' 
          : 'bg-green-50 dark:bg-green-900/20'
      )}>
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
            {editedTx.type === 'expense' ? '💸 รายจ่าย' : '💰 รายรับ'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[240px]">
            {transaction.originalText}
          </p>
        </div>
        <div className="text-right">
          <p className={clsx(
            'text-2xl font-bold',
            editedTx.type === 'expense' 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-green-600 dark:text-green-400'
          )}>
            ฿{totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">รวมทั้งหมด</p>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {editedTx.items.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div className="flex-1 space-y-2">
              {/* Description */}
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                placeholder="รายการ..."
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 
                           dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex gap-2">
                {/* Category */}
                <select
                  value={item.category}
                  onChange={(e) => updateItem(index, { category: e.target.value })}
                  className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 
                             dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                {/* Amount */}
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateItem(index, { amount: Number(e.target.value) })}
                  className="w-24 bg-white dark:bg-gray-700 border border-gray-200 
                             dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-right
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Merchant (optional) */}
              <input
                type="text"
                value={item.merchant || ''}
                onChange={(e) => updateItem(index, { 
                  merchant: e.target.value || null 
                })}
                placeholder="ร้าน/สถานที่ (ถ้ามี)"
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 
                           dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Remove Item */}
            <button
              onClick={() => removeItem(index)}
              disabled={editedTx.items.length === 1}
              className="self-start p-1.5 text-red-400 hover:text-red-600 
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      <div className="px-4 pb-2">
        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 py-2 
                     border-2 border-dashed border-gray-300 dark:border-gray-600
                     rounded-xl text-gray-500 dark:text-gray-400
                     hover:border-blue-400 hover:text-blue-500 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          เพิ่มรายการ
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex gap-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 py-3 
                     bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                     rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600
                     transition-colors font-medium"
        >
          <X className="w-4 h-4" />
          ยกเลิก
        </button>
        <button
          onClick={() => onConfirm(editedTx)}
          disabled={editedTx.items.length === 0 || editedTx.items.some(i => !i.description)}
          className="flex-2 flex-1 flex items-center justify-center gap-2 py-3 
                     bg-blue-600 hover:bg-blue-700 text-white
                     rounded-xl transition-colors font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          บันทึก ✅
        </button>
      </div>
    </div>
  );
}