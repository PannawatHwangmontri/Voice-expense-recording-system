// src/app/api/expense/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // เพิ่ม user_id จาก session
    const payload = {
      ...body,
      user_id: session.user?.email || 'anonymous',
      timestamp: new Date().toISOString(),
    };

    // ส่งไปที่ n8n Webhook
    const n8nResponse = await fetch(
      process.env.N8N_WEBHOOK_URL!,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status}`);
    }

    const data = await n8nResponse.json();
    
    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Expense API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' 
      },
      { status: 500 }
    );
  }
}