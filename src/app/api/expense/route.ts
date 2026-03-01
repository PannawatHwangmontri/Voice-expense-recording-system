// src/app/api/expense/route.ts
import { NextRequest, NextResponse } from 'next/server';

const N8N_POST_URL = process.env.N8N_WEBHOOK_URL!;
const N8N_GET_URL = process.env.N8N_GET_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL!;
const N8N_DELETE_URL = process.env.N8N_DELETE_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL!;

// POST — ส่งข้อมูลเสียงไปให้ n8n ประมวลผลและบันทึก
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload = {
      ...body,
      timestamp: new Date().toISOString(),
    };

    const n8nResponse = await fetch(N8N_POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status}`);
    }

    const n8nData = await n8nResponse.json();

    // n8n Build Success Response:  { success:true, message, data: ParsedTransaction }
    // n8n Build Confirm Response:  { success:false, requiresConfirmation:true, question, partialData }
    // n8n Build Command Response:  { success:true, isCommand:true, message }
    //
    // ถ้ามี .data = บันทึกสำเร็จ → ส่ง ParsedTransaction ขึ้นไปให้ frontend โดยตรง
    if (n8nData.data) {
      return NextResponse.json({ success: true, data: n8nData.data });
    }
    // ถ้าไม่มี .data = confirm / command → ส่ง n8nData ตรงๆ (มี requiresConfirmation, question)
    return NextResponse.json(n8nData);

  } catch (error) {
    console.error('Expense API Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}

// GET — ดึงรายการทั้งหมดจาก n8n (Google Sheets)
// หมายเหตุ: n8n webhook node ที่ไม่ระบุ httpMethod จะ default เป็น POST
export async function GET() {
  try {
    console.log('[GET] Fetching from n8n:', N8N_GET_URL);

    // ลอง GET ก่อน ถ้าไม่ได้ผลให้ fallback เป็น POST
    const tryFetch = async (method: 'GET' | 'POST') =>
      fetch(N8N_GET_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(method === 'POST' ? { body: JSON.stringify({ action: 'get_all' }) } : {}),
        cache: 'no-store',
      });

    let n8nResponse = await tryFetch('GET');
    let rawText = await n8nResponse.text();
    console.log('[GET] GET method status:', n8nResponse.status, 'body length:', rawText.length);

    // ถ้า GET ไม่ได้ผล (empty body หรือ error) ลอง POST แทน
    if (!n8nResponse.ok || !rawText || rawText.trim() === '') {
      console.log('[GET] GET returned empty/error, trying POST...');
      n8nResponse = await tryFetch('POST');
      rawText = await n8nResponse.text();
      console.log('[GET] POST method status:', n8nResponse.status, 'body length:', rawText.length);
    }

    if (!rawText || rawText.trim() === '') {
      console.warn('[GET] Both methods returned empty body');
      return NextResponse.json({ success: true, data: [] });
    }

    console.log('[GET] raw response preview:', rawText.slice(0, 200));

    // parse JSON (handle double-encoded string จาก n8n)
    let data = JSON.parse(rawText);
    if (typeof data === 'string') {
      data = JSON.parse(data); // n8n อาจ double-serialize
    }

    // normalize: n8n อาจ return array โดยตรง หรือ { success, data: [...] }
    const entries = Array.isArray(data) ? data : (data.data ?? []);
    console.log('[GET] entries count:', entries.length);

    return NextResponse.json({ success: true, data: entries });

  } catch (error) {
    console.warn('[GET] Error:', (error as Error).message);
    return NextResponse.json({ success: true, data: [] });
  }
}

// DELETE — ลบรายการจาก Google Sheets ผ่าน n8n
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'ไม่ระบุ ID รายการที่จะลบ' }, { status: 400 });
    }

    console.log('[DELETE] Deleting entry:', id);

    const n8nResponse = await fetch(N8N_DELETE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });

    const text = await n8nResponse.text();
    console.log('[DELETE] n8n response:', n8nResponse.status, text);

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status}`);
    }

    return NextResponse.json({ success: true, message: 'ลบรายการเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('[DELETE] Error:', (error as Error).message);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการลบ' }, { status: 500 });
  }
}
