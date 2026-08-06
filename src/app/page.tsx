import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24 bg-[#FDFDFE] text-slate-900 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#7C3AED]/10 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 max-w-5xl w-full items-center justify-between lg:flex flex-col gap-12 relative">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-[#6D28D9] text-sm font-semibold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6D28D9]"></span>
            </span>
            Сквозная аналитика нового поколения
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl">
            Управляйте бизнесом на основе <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-blue-600">точных данных</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            Платформа сквозной аналитики AnalyticsPro. Отслеживайте клики, лиды и продажи в одном месте. Увеличьте конверсию и ROI с помощью интеллектуальных алгоритмов.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white transition-colors shadow-lg shadow-purple-500/30 text-center font-medium text-lg flex items-center justify-center gap-2"
          >
            Войти в систему
          </Link>
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-sm text-center font-medium text-lg"
          >
            Создать аккаунт
          </Link>
        </div>

        {/* Mock Graphic on Landing */}
        <div className="mt-16 w-full max-w-4xl bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex flex-col relative overflow-hidden">
           <div className="flex items-center gap-2 mb-4 px-2">
             <div className="w-3 h-3 rounded-full bg-red-400" />
             <div className="w-3 h-3 rounded-full bg-yellow-400" />
             <div className="w-3 h-3 rounded-full bg-green-400" />
           </div>
           <div className="w-full h-[400px] bg-[#FDFDFE] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center">
             <div className="text-center mb-8">
               <h3 className="text-2xl font-bold text-slate-900">Ваша аналитика в реальном времени</h3>
               <p className="text-slate-500 mt-2">Визуализация всех ключевых метрик на одном дашборде</p>
             </div>
             
             <div className="grid grid-cols-3 gap-4 w-full max-w-2xl px-8">
               <div className="h-24 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col justify-center px-6">
                 <div className="text-sm text-slate-500 mb-1">Выручка</div>
                 <div className="text-2xl font-bold text-slate-900">12.4M ₽</div>
               </div>
               <div className="h-24 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col justify-center px-6">
                 <div className="text-sm text-slate-500 mb-1">Лиды</div>
                 <div className="text-2xl font-bold text-slate-900">342</div>
               </div>
               <div className="h-24 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col justify-center px-6">
                 <div className="text-sm text-slate-500 mb-1">ROI</div>
                 <div className="text-2xl font-bold text-[#6D28D9]">319%</div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </main>
  );
}