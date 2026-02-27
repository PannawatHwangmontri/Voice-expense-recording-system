// src/hooks/useExpenseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LedgerEntry, ParsedTransaction, Status } from '@/types/expense';

interface ExpenseStore {
  // Voice recording state
  transactions: ParsedTransaction[];
  currentTransaction: ParsedTransaction | null;
  status: Status;

  // Ledger (ข้อมูลจาก n8n หรือ local)
  ledger: LedgerEntry[];
  localEntries: LedgerEntry[]; // persist ไว้ใน localStorage
  isLoadingLedger: boolean;

  // Actions
  setCurrentTransaction: (tx: ParsedTransaction | null) => void;
  addTransaction: (tx: ParsedTransaction) => void;
  setStatus: (status: Status) => void;
  setLedger: (entries: LedgerEntry[]) => void;
  setLoadingLedger: (loading: boolean) => void;
  clearAll: () => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      transactions: [],
      currentTransaction: null,
      status: 'idle',
      ledger: [],
      localEntries: [],
      isLoadingLedger: false,

      setCurrentTransaction: (tx) => set({ currentTransaction: tx }),

      addTransaction: (tx) =>
        set((state) => {
          // แปลง ParsedTransaction → LedgerEntry[] เพื่อ persist ไว้ด้วย
          const newEntries: LedgerEntry[] = (tx.items ?? []).map((item, i) => ({
            id: `local_${Date.now()}_${i}`,
            date: tx.timestamp,
            type: tx.type,
            description: item.description,
            category: item.category || 'อื่นๆ',
            amount: item.amount,
            note: item.merchant || '',
          }));
          return {
            transactions: [tx, ...state.transactions],
            localEntries: [...newEntries, ...state.localEntries],
            currentTransaction: null,
          };
        }),

      setStatus: (status) => set({ status }),

      setLedger: (entries) => set({ ledger: entries }),

      setLoadingLedger: (loading) => set({ isLoadingLedger: loading }),

      clearAll: () =>
        set({
          transactions: [],
          currentTransaction: null,
          status: 'idle',
          ledger: [],
          localEntries: [],
        }),
    }),
    {
      name: 'expense-storage',
      // persist transactions + localEntries (แสดงตารางได้แม้ n8n GET ยังไม่พร้อม)
      partialize: (state) => ({
        transactions: state.transactions,
        localEntries: state.localEntries,
      }),
    }
  )
);