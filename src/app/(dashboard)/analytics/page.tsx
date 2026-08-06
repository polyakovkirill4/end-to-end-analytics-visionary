import { Calendar, Filter, Target } from 'lucide-react';
import { StatCard } from '@/components/analytics/StatCard';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { AnalyticsTable } from '@/components/analytics/AnalyticsTable';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Сквозная аналитика</h1>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 transition-colors shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            Последние 30 дней
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 transition-colors shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            Каналы
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 transition-colors shadow-sm">
            <Target className="w-4 h-4 text-slate-500" />
            Цели
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Выручка" 
          value="1 250 000 ₽" 
          trend="up" 
          trendValue="12%" 
          trendText="к прошлому периоду" 
        />
        <StatCard 
          title="Прибыль" 
          value="450 000 ₽" 
          trend="up" 
          trendValue="8%" 
          trendText="к прошлому периоду" 
        />
        <StatCard 
          title="Лиды" 
          value="342" 
          trend="down" 
          trendValue="3%" 
          trendText="к прошлому периоду" 
        />
        <StatCard 
          title="ROI" 
          value="185%" 
          trend="up" 
          trendValue="15%" 
          trendText="к прошлому периоду" 
        />
      </div>

      <AnalyticsChart />
      
      <AnalyticsTable />
    </div>
  );
}
