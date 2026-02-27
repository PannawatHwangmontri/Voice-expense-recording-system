// src/types/expense.ts

export type TransactionType = 'expense' | 'income';

export type Status =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'confirming'
  | 'saved'
  | 'error';

export type FilterType = 'all' | 'income' | 'expense';

// รายการย่อยในธุรกรรม
export interface ExpenseItem {
  id?: string;
  description: string;
  category: string;
  amount: number;
  merchant: string | null;
}

// ธุรกรรมที่ parse จากเสียง (ใช้ระหว่าง confirm)
export interface ParsedTransaction {
  type: TransactionType;
  items: ExpenseItem[];
  originalText: string;
  timestamp: string;
  userId: string;
}

// แถวในตารางบัญชีรายรับ-รายจ่าย (จาก n8n)
export interface LedgerEntry {
  id: string;
  date: string;          // ISO string หรือ "DD/MM/YYYY"
  type: TransactionType; // 'income' | 'expense'
  description: string;
  category: string;
  amount: number;
  note?: string;
}

// Payload ที่ส่งไป n8n
export interface WebhookPayload {
  text: string;
  user_id: string;
  timestamp: string;
  command?: string;
}

// Response จาก n8n POST (บันทึก)
// มี 3 รูปแบบ:
// 1. Build Success Response: { success:true, message, data: ParsedTransaction }
// 2. Build Confirm Response: { success:false, requiresConfirmation:true, question, partialData }
// 3. Build Command Response: { success:true, isCommand:true, message }
export interface WebhookResponse {
  success: boolean;
  data?: ParsedTransaction;
  message?: string;
  // Confirm response
  requiresConfirmation?: boolean;
  question?: string;
  partialData?: { type: TransactionType; items: ExpenseItem[] };
  // Command response (เช่น "สรุป", "วันนี้ใช้เท่าไหร่")
  isCommand?: boolean;
}

// Response จาก n8n GET (ดึงรายการ)
export interface LedgerResponse {
  success: boolean;
  data: LedgerEntry[];
  totalIncome?: number;
  totalExpense?: number;
}

// ข้อมูลสรุป
export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}