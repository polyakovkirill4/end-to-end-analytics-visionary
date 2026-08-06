import { getProjectMetrics } from '@/services/analytics/engine';
import { TrendingUp } from 'lucide-react';
import DateRangePicker from '@/components/filters/DateRangePicker';
import { StatCard } from '@/components/analytics/StatCard';

export default async function ProjectOverviewPage(props: { 
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{ from?: string; to?: string }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const from = searchParams.from;
    const to = searchParams.to;
    const dateRange = from && to ? { from, to } : undefined;

    const metrics = await getProjectMetrics(params.projectId, dateRange);

    // Вспомогательная функция для форматирования денег
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Аналитика проекта</h1>

                <div className="flex items-center gap-3">
                    <DateRangePicker />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Выручка" 
                    value={formatCurrency(metrics.totalRevenue)} 
                    trend="up"
                    trendValue="12%"
                    trendText="к прошлому периоду"
                />
                
                <StatCard
                    title="ROMI" 
                    value={`${metrics.romi.toFixed(1)}%`} 
                    trend="up"
                    trendValue="5%"
                    trendText="к прошлому периоду"
                />

                <StatCard
                    title="Трафик (Сессии)" 
                    value={metrics.totalTraffic.toString()}
                    trend="up"
                    trendValue="-"
                    trendText="к прошлому периоду"
                />

                <StatCard
                    title="Лиды" 
                    value={metrics.totalLeads.toString()} 
                    trend="up"
                    trendValue={`Конверсия: ${metrics.conversionRate.toFixed(1)}%`}
                    trendText="к прошлому периоду"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Экономика */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900">
                        <TrendingUp className="text-indigo-600" size={20} />
                        Юнит-экономика
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-500 text-sm font-medium">Расход на рекламу</span>
                            <span className="font-bold text-red-500">-{formatCurrency(metrics.totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-500 text-sm font-medium">CPL (Стоимость лида)</span>
                            <span className="font-bold text-amber-500">{formatCurrency(metrics.cpl)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-500 text-sm font-medium">CAC (Стоимость клиента)</span>
                            <span className="font-bold text-orange-500">{formatCurrency(metrics.cac)}</span>
                        </div>
                    </div>
                </div>

                {/* Место под график */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col justify-center items-center text-slate-500 min-h-[300px]">
                    Здесь будет график Recharts
                    <div className="mt-2 text-sm text-center max-w-xs text-slate-500">Данные будут загружаться из сервиса аналитики с группировкой по дням.</div>
                </div>
            </div>
        </div>
    );
}
