'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar';
import { DashboardHeader } from '@/components/layouts/DashboardHeader';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[#FDFDFE] text-slate-900 font-sans">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col ml-64">
        <DashboardHeader />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
            <div className="relative w-full max-w-lg p-8 sm:p-12 flex flex-col items-center text-center bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#6D28D9]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                <FileQuestion className="w-10 h-10 text-[#6D28D9]" />
              </div>
              
              <h1 className="text-7xl font-extrabold text-[#6D28D9] tracking-tighter mb-4 relative z-10">
                404
              </h1>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">
                Ой, страница не найдена
              </h2>
              
              <p className="text-slate-500 mb-10 max-w-sm text-balance relative z-10">
                Возможно, она была удалена, перенесена или вы просто ошиблись в адресе.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
                <button 
                  onClick={() => router.back()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Назад
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
