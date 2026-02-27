// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-thai',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'ระบบบัญชีรายรับ-รายจ่าย 📒',
  description: 'บันทึกรายรับ-รายจ่ายด้วยเสียง ส่งข้อมูลผ่าน n8n อัตโนมัติ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSansThai.variable}
                    font-sans bg-slate-50 dark:bg-gray-950
                    text-gray-900 dark:text-gray-100
                    min-h-screen transition-colors duration-300`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: '#1e293b', color: '#f1f5f9', fontFamily: 'var(--font-thai)' },
          }}
        />
      </body>
    </html>
  );
}