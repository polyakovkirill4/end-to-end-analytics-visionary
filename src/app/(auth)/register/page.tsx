import { register } from '../actions';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, MousePointerClick, Users, Flame, ShoppingCart } from 'lucide-react';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  
  const registerGraphic = (
    <div className="w-full max-w-sm flex flex-col items-center gap-3 relative mt-8">
      {/* Connecting line */}
      <div className="absolute top-0 bottom-0 left-12 border-l border-white/20 w-px z-0"></div>

      <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between relative z-10 shadow-lg transform transition-transform hover:-translate-y-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <MousePointerClick className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Клики</span>
        </div>
        <span className="text-white/80 font-medium text-sm pr-2">100%</span>
      </div>

      <div className="w-[95%] bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between relative z-10 shadow-lg transform transition-transform hover:-translate-y-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Визиты</span>
        </div>
        <span className="text-white/80 font-medium text-sm pr-2">45%</span>
      </div>

      <div className="w-[90%] bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between relative z-10 shadow-lg transform transition-transform hover:-translate-y-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Лиды</span>
        </div>
        <span className="text-white/80 font-medium text-sm pr-2">12%</span>
      </div>

      <div className="w-[85%] bg-[#4B0082]/60 backdrop-blur-md rounded-2xl p-4 border border-[#4B0082]/80 flex items-center justify-between relative z-10 shadow-xl transform transition-transform hover:-translate-y-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Продажи</span>
        </div>
        <span className="text-white font-bold text-sm pr-2">3.2%</span>
      </div>
    </div>
  );

  return (
    <AuthLayout
      rightTitle="Сквозная аналитика: от клика до продажи"
      rightGraphic={registerGraphic}
    >
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Создать аккаунт</h1>
        <p className="text-slate-500 text-sm">
          Начните управлять эффективностью вашего бизнеса уже сегодня.
        </p>
      </div>

      {resolvedParams.error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 font-medium">
          {resolvedParams.error}
        </div>
      )}

      <form action={register} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold text-slate-700">Имя</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              id="name" 
              name="name" 
              type="text" 
              placeholder="Иван Иванов"
              required 
              className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm transition-all"
            />
          </div>
        </div>

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
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">Пароль</label>
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
              className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 tracking-[0.2em] font-medium focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 mt-1">
          <div className="flex items-center h-5">
            <input 
              id="terms" 
              name="terms" 
              type="checkbox" 
              required
              className="w-4 h-4 rounded border-slate-300 text-[#6D28D9] focus:ring-[#6D28D9] bg-white cursor-pointer"
            />
          </div>
          <div className="text-sm text-slate-600">
            <label htmlFor="terms" className="cursor-pointer">
              Я подтверждаю свое согласие с {' '}
              <Link href="#" className="text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
                правилами использования
              </Link>
              {' '} и политикой конфиденциальности.
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className="mt-2 w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white p-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
        >
          Зарегистрироваться
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="mt-8 text-center">
        <span className="text-slate-500 text-sm">Уже есть аккаунт? </span>
        <Link href="/login" className="text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
          Войти
        </Link>
      </div>
    </AuthLayout>
  );
}