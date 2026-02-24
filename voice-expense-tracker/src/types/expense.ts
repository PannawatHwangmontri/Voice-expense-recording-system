// src/types/expense.ts

export type TransactionType = 'expense' | 'income';

export type Status = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'confirming' 
  | 'saved' 
  | 'error';

export interface ExpenseItem {
  id?: string;
  description: string;
  category: string;
  amount: number;
  merchant: string | null;
}

export interface ParsedTransaction {
  type: TransactionType;
  items: ExpenseItem[];
  originalText: string;
  timestamp: string;
  userId: string;
}

export interface WebhookPayload {
  text: string;
  user_id: string;
  timestamp: string;
  command?: string;
}

export interface WebhookResponse {
  success: boolean;
  data?: ParsedTransaction;
  message?: string;
  requiresConfirmation?: boolean;
  question?: string;
}

export interface DashboardData {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  byCategory: { name: string; amount: number; color: string }[];
  dailyTrend: { date: string; expense: number; income: number }[];
  topItems: ExpenseItem[];
}