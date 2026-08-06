import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const resolvedParams = await searchParams;
  
  const forgotPasswordGraphic = (
    <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl relative h-64 overflow-hidden mt-8">
      {/* Bars */}
      <div className="absolute inset-x-8 bottom-8 top-16 flex items-end justify-between gap-4">
        <div className="w-full bg-white/20 rounded-t-sm h-[30%] relative z-10"></div>
        <div className="w-full bg-white/30 rounded-t-sm h-[45%] relative z-10"></div>
        <div className="w-full bg-white/40 rounded-t-sm h-[65%] relative z-10"></div>
        <div className="w-full bg-white/30 rounded-t-sm h-[40%] relative z-10"></div>
        <div className="w-full bg-white/60 rounded-t-sm h-[80%] relative z-10"></div>
        <div className="w-full bg-white/80 rounded-t-sm h-[100%] relative z-10"></div>
      </div>
      
      {/* Overlay Curve */}
      <div className="absolute inset-0 z-20">
        <svg viewBox="0 0 500 256" preserveAspectRatio="none" className="w-full h-full">
          <path 
            d="M 40 180 Q 150 150 250 160 T 460 90" 
            fill="none" 
            stroke="white" 
            strokeWidth="3"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
          <circle cx="210" cy="155" r="4" fill="white" />
          <circle cx="330" cy="120" r="4" fill="white" />
        </svg>
      </div>
    </div>
  );

  return (
    <AuthLayout
      rightTitle="Вернитесь к аналитике ваших рекламных каналов"
      rightSubtitle="Мы поможем быстро восстановить доступ к вашим данным."
      rightGraphic={forgotPasswordGraphic}
    >
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Восстановление доступа</h1>
        <p className="text-slate-500 text-sm">
          Введите email, чтобы получить инструкции
        </p>
      </div>

      {resolvedParams.error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 font-medium">
          {resolvedParams.error}
        </div>
      )}

      {resolvedParams.message && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm text-center border border-green-100 font-medium">
          {resolvedParams.message}
        </div>
      )}

      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="name@company.com"
            required 
            className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm transition-all"
          />
        </div>

        <button 
          type="button" 
          className="mt-2 w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white p-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
        >
          Отправить ссылку
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Вернуться ко входу
        </Link>
      </div>
    </AuthLayout>
  );
}
