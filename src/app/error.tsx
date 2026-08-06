'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar';
import { DashboardHeader } from '@/components/layouts/DashboardHeader';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Unhandled global error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen bg-[#FDFDFE] text-slate-900 font-sans">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col ml-64">
        <DashboardHeader />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
            <div className="relative w-full max-w-lg p-8 sm:p-12 flex flex-col items-center text-center bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                <AlertOctagon className="w-10 h-10 text-red-500" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 relative z-10">
                Упс, ошибка!
              </h1>
              
              <p className="text-slate-500 mb-10 max-w-sm text-balance relative z-10">
                Произошел технический сбой. Мы уже получили отчет и работаем над исправлением. 
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
                <button 
                  onClick={() => reset()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 transition-colors shadow-sm group"
                >
                  <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                  Повторить
                </button>
                
                <Link 
                  href="/analytics" 
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-medium transition-colors shadow-md shadow-purple-500/20"
                >
                  <Home className="w-5 h-5" />
                  На главную
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
