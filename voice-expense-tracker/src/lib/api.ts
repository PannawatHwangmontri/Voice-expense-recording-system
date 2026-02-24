// src/lib/api.ts
import axios from 'axios';
import { WebhookPayload, WebhookResponse, DashboardData } from '@/types/expense';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ส่งข้อความไปให้ n8n ประมวลผล
export async function processVoiceText(
  payload: WebhookPayload
): Promise<WebhookResponse> {
  const response = await api.post<WebhookResponse>('/expense', payload);
  return response.data;
}

// ดึงข้อมูล Dashboard
export async function getDashboardData(
  userId: string,
  period: 'day' | 'week' | 'month' = 'month'
): Promise<DashboardData> {
  const response = await api.get<DashboardData>(
    `/dashboard?userId=${userId}&period=${period}`
  );
  return response.data;
}

// ยกเลิกรายการล่าสุด
export async function cancelLastEntry(userId: string): Promise<{ success: boolean }> {
  const response = await api.delete(`/expense/last?userId=${userId}`);
  return response.data;
}

export default api;