// src/hooks/useExpenseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ParsedTransaction, Status } from '@/types/expense';

interface ExpenseStore {
  // State
  transactions: ParsedTransaction[];
  currentTransaction: ParsedTransaction | null;
  status: Status;
  lastSavedId: string | null;
  
  // Actions
  setCurrentTransaction: (tx: ParsedTransaction | null) => void;
  addTransaction: (tx: ParsedTransaction) => void;
  removeLastTransaction: () => void;
  setStatus: (status: Status) => void;
  setLastSavedId: (id: string) => void;
  clearAll: () => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      transactions: [],
      currentTransaction: null,
      status: 'idle',
      lastSavedId: null,

      setCurrentTransaction: (tx) => set({ currentTransaction: tx }),
      
      addTransaction: (tx) => set((state) => ({
        transactions: [tx, ...state.transactions],
        currentTransaction: null,
      })),
      
      removeLastTransaction: () => set((state) => ({
        transactions: state.transactions.slice(1),
      })),
      
      setStatus: (status) => set({ status }),
      
      setLastSavedId: (id) => set({ lastSavedId: id }),
      
      clearAll: () => set({ 
        transactions: [], 
        currentTransaction: null,
        status: 'idle',
      }),
    }),
    {
      name: 'expense-storage', // LocalStorage key
    }
  )
);