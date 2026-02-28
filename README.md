# MoneyFlow — ระบบบัญชีรายรับ-รายจ่ายด้วยเสียง และแชท AI

> บันทึกรายรับ-รายจ่ายด้วยเสียงหรือพิมพ์ข้อความ ประมวลผลอัตโนมัติด้วย Gemini AI ผ่าน n8n และบันทึกลง Google Sheets

![MoneyFlow Screenshot](voice-expense-tracker/public/screenshot.png)

---

## ✨ Features

- 🎙 **Voice Input** — พูดบันทึกค่าใช้จ่ายได้ทันที (Chrome / Edge)
- 💬 **Chat Input** — พิมพ์ข้อความแทนเสียงได้
- 🤖 **AI Processing** — Gemini AI แปลงข้อความเป็นรายการรายรับ-รายจ่ายอัตโนมัติ
- 📊 **Google Sheets** — บันทึกข้อมูลลง Google Sheets แบบ real-time
- 🗑 **Delete** — ลบรายการผ่านหน้าเว็บได้
- 📱 **Responsive** — รองรับมือถือและ Desktop

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend/Automation | n8n (Cloud) |
| AI | Google Gemini 2.5 Flash |
| Database | Google Sheets |
| Font | Plus Jakarta Sans |

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/PannawatHwangmontri/Voice-expense-recording-system.git
cd Voice-expense-recording-system/voice-expense-tracker
npm install
```

### 2. สร้างไฟล์ `.env.local` ⚠️

> **สำคัญ:** ต้องสร้างไฟล์นี้ก่อน ไม่งั้นระบบจะไม่สามารถเชื่อมต่อกับ n8n ได้

สร้างไฟล์ [`voice-expense-tracker/.env.local`](voice-expense-tracker/.env.local) แล้วใส่ค่าดังนี้:

```env
# n8n Webhook URLs
N8N_WEBHOOK_URL=https://YOUR_N8N_INSTANCE/webhook/voice-expense
N8N_GET_WEBHOOK_URL=https://YOUR_N8N_INSTANCE/webhook/voice-expense-list
N8N_DELETE_WEBHOOK_URL=https://YOUR_N8N_INSTANCE/webhook/voice-expense-delete
```

> แทน `YOUR_N8N_INSTANCE` ด้วย domain n8n ของคุณ  
> ตัวอย่าง: `https://yourname.app.n8n.cloud`

### 3. Run Development Server

```bash
npm run dev
```

เปิดที่ [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
voice-expense-tracker/
├── src/
│   ├── app/
│   │   ├── api/expense/route.ts   # API routes → n8n proxy
│   │   ├── page.tsx               # Main page
│   │   ├── layout.tsx             # Root layout + fonts
│   │   └── globals.css            # Global styles + design tokens
│   ├── components/
│   │   ├── VoiceRecorder.tsx      # Voice + Chat input
│   │   ├── TransactionTable.tsx   # รายการธุรกรรม + ลบ
│   │   ├── SummaryBar.tsx         # สรุปรายรับ/รายจ่าย/คงเหลือ
│   │   ├── ExpenseForm.tsx        # ฟอร์มยืนยันรายการ
│   │   └── StatusBadge.tsx        # สถานะการทำงาน
│   ├── hooks/
│   │   ├── useVoiceRecognition.ts # Web Speech API hook
│   │   └── useExpenseStore.ts     # Zustand state store
│   ├── lib/
│   │   └── api.ts                 # API functions
│   └── types/
│       └── expense.ts             # TypeScript interfaces
├── .env.local                     # ⚠️ ต้องสร้างเอง (ดูด้านบน)
└── package.json
```

---

## 🔗 n8n Workflow

ระบบใช้ n8n 3 workflows:

| Webhook Path | หน้าที่ |
|---|---|
| `/webhook/voice-expense` | POST — รับข้อความ + Gemini AI → บันทึก Google Sheets |
| `/webhook/voice-expense-list` | GET — ดึงรายการทั้งหมดจาก Google Sheets |
| `/webhook/voice-expense-delete` | POST — ลบรายการตาม Timestamp |

---

## 📝 ตัวอย่างการใช้งาน

```
"กินก๋วยเตี๋ยว 50 กาแฟ 40"
→ บันทึก: อาหาร ฿50, เครื่องดื่ม ฿40

"ได้เงินเดือน 15000"
→ บันทึก: รายรับ ฿15,000

"ค่าไฟเดือนนี้ 800 บาท"
→ บันทึก: สาธารณูปโภค ฿800
```

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|---|---|---|
| `N8N_WEBHOOK_URL` | n8n webhook สำหรับบันทึกข้อมูล (POST) | ✅ |
| `N8N_GET_WEBHOOK_URL` | n8n webhook สำหรับดึงข้อมูล (GET/POST) | ✅ |
| `N8N_DELETE_WEBHOOK_URL` | n8n webhook สำหรับลบข้อมูล (POST) | ✅ |

---

## 📄 License

MIT License © 2026 Pannawat Hwangmontri