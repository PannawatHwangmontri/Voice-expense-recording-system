// src/app/page.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, LogOut, BarChart2, Mic } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const { transactions } = useExpenseStore();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 
                     dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 
                      border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-6 h-6 text-blue-600" />
            <h1 className="font-bold text-lg text-gray-800 dark:text-white">
              Voice Expense
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                         bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Dashboard
            </Link>
            
            {session ? (
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-sm text-gray-600 
                             dark:text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                           border border-gray-300 dark:border-gray-600 text-sm
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            🎙️ บันทึกด้วยเสียง
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            พูดรายจ่าย-รายรับ ระบบจัดการให้อัตโนมัติ
          </p>
        </div>

        {/* Voice Recorder */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
          <VoiceRecorder />
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              📋 รายการล่าสุด
            </h3>
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 
                             shadow-sm border border-gray-100 dark:border-gray-700
                             flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {tx.items.map(i => i.description).join(', ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(tx.timestamp), 'dd MMM yyyy HH:mm', { locale: th })}
                    </p>
                  </div>
                  <span className={`font-bold ${
                    tx.type === 'expense' 
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }`}>
                    {tx.type === 'expense' ? '-' : '+'}
                    ฿{tx.items.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}