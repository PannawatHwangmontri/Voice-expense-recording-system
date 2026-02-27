// src/lib/api.ts
import { LedgerEntry, WebhookPayload, WebhookResponse } from '@/types/expense';

// ส่งข้อความเสียงไปให้ n8n ประมวลผล
export async function processVoiceText(
  payload: WebhookPayload
): Promise<WebhookResponse> {
  const res = await fetch('/api/expense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ดึงรายการทั้งหมดจาก n8n (ตารางบัญชี)
export async function fetchLedger(): Promise<LedgerEntry[]> {
  const res = await fetch('/api/expense', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
}