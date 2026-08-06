import { login } from '../actions';
import Link from 'next/link';
import { Mail, Lock, EyeOff, ArrowRight, TrendingUp } from 'lucide-react';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  
  const loginGraphic = (
    <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div className="text-left">
          <p className="text-white/60 text-xs font-bold tracking-wider mb-2 uppercase">Выручка (Q3)</p>
          <p className="text-white text-4xl font-bold">12 450 000 ₽</p>
        </div>
        <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-white" />
          <span className="text-white font-medium text-sm">+24%</span>
        </div>
      </div>
      
      {/* Mock Chart Area */}
      <div className="absolute bottom-0 left-0 right-0 h-[140px]">
        <svg viewBox="0 0 500 140" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
            </linearGradient>
          </defs>
          <path 
            d="M0 120 C 50 110, 100 130, 150 110 S 250 80, 300 80 S 350 70, 400 60 S 450 60, 500 60 L 500 140 L 0 140 Z" 
            fill="url(#chartGradient)" 
          />
          <path 
            d="M0 120 C 50 110, 100 130, 150 110 S 250 80, 300 80 S 350 70, 400 60 S 450 60, 500 60" 
            fill="none" 
            stroke="white" 
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="150" cy="110" r="4" fill="#7C3AED" stroke="white" strokeWidth="2" />
          <circle cx="300" cy="80" r="4" fill="#7C3AED" stroke="white" strokeWidth="2" />
          <circle cx="400" cy="60" r="4" fill="#7C3AED" stroke="white" strokeWidth="2" />
          <circle cx="500" cy="60" r="4" fill="#7C3AED" stroke="white" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );

  return (
    <AuthLayout
      rightTitle="Управляйте маркетингом на основе данных"
      rightSubtitle="Мощная аналитика для принятия точных решений. Увеличьте конверсию и ROI с помощью интеллектуальных алгоритмов."
      rightGraphic={loginGraphic}
    >
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Вход в сервис</h1>
        <p className="text-slate-500 text-sm">
          Добро пожаловать обратно! Пожалуйста, введите ваши данные.
        </p>
      </div>

      {resolvedParams.error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 font-medium">
          {resolvedParams.error}
        </div>
      )}

      <form action={login} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="name@company.com"
              required 
              className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">Пароль</label>
            <Link href="/forgot-password" className="text-xs font-medium text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
              Забыли пароль?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••"
              required 
              className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3.5 pl-11 pr-11 text-slate-900 placeholder:text-slate-400 tracking-[0.2em] font-medium focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer group">
              <EyeOff className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="mt-2 w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white p-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
        >
          Войти
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="mt-8 text-center">
        <span className="text-slate-500 text-sm">Нет аккаунта? </span>
        <Link href="/register" className="text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
          Зарегистрироваться
        </Link>
      </div>
    </AuthLayout>
  );
}