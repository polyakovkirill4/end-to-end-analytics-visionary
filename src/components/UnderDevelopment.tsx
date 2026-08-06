'use client';

import React from 'react';
import Link from 'next/link';
import { Hammer, ArrowLeft } from 'lucide-react';

export function UnderDevelopment() {
  return (
    <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Декоративное свечение на фоне */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/3 -translate-y-1/3 w-[300px] h-[300px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md text-center bg-white border border-slate-100/80 rounded-[32px] p-8 md:p-12 shadow-[0_10px_50px_-12px_rgba(109,40,217,0.08)]">
        
        {/* Контейнер для анимированной иконки */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-[24px] bg-[#F5F3FA] text-[#6D28D9] mb-8 shadow-inner shadow-purple-100/50 group overflow-hidden">
          <div className="absolute inset-0 bg-[#6D28D9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Hammer className="w-10 h-10 animate-bounce transition-transform duration-300" style={{ animationDuration: '2s' }} />
        </div>

        {/* Текстовый блок */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
          Раздел в разработке
        </h1>
        <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
          Данная страница находится в процессе доработки. Мы активно настраиваем этот функционал для вас.
        </p>

        {/* Кнопка возврата */}
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к проектам
        </Link>
      </div>
    </div>
  );
}
