// src/app/layout.tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Thai } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-thai',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MoneyFlow — ระบบบัญชีรายรับ-รายจ่าย',
  description: 'บันทึกรายรับ-รายจ่ายด้วยเสียง อัจฉริยะด้วย AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${notoSansThai.variable}`} suppressHydrationWarning>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0D1321',
              color: '#F0F4FF',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontFamily: 'var(--font-thai), var(--font-jakarta), sans-serif',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}