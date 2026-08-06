import { getProjectMetrics } from '@/services/analytics/engine';
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, MousePointerClick, TrendingUp } from 'lucide-react';
import DateRangePicker from '@/components/filters/DateRangePicker';

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
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-900">Аналитика проекта</h1>
                    <p className="text-slate-500 text-sm">Обзор ключевых показателей проекта.</p>
                </div>
                <DateRangePicker />
            </div>

            {/* Карточки с метриками */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <MetricCard 
                    title="Выручка" 
                    value={formatCurrency(metrics.totalRevenue)} 
                    icon={<DollarSign className="text-emerald-400" />}
                    trend="+12%" 
                    isPositive={true} 
                />
                
                <MetricCard 
                    title="ROMI" 
                    value={`${metrics.romi.toFixed(1)}%`} 
                    icon={<TrendingUp className="text-blue-400" />}
                    trend="+5%" 
                    isPositive={true} 
                />

                <MetricCard 
                    title="Трафик (Сессии)" 
                    value={metrics.totalTraffic.toString()} 
                    icon={<MousePointerClick className="text-purple-400" />}
                />

                <MetricCard 
                    title="Лиды" 
                    value={metrics.totalLeads.toString()} 
                    icon={<Users className="text-orange-400" />}
                    subtitle={`Конверсия: ${metrics.conversionRate.toFixed(1)}%`}
                />

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Экономика */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
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
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-slate-500 min-h-[300px]">
                    Здесь будет график Recharts
                    <div className="mt-2 text-sm text-center max-w-xs text-slate-500">Данные будут загружаться из сервиса аналитики с группировкой по дням.</div>
                </div>
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    isPositive?: boolean;
    subtitle?: string;
}

function MetricCard({ title, value, icon, trend, isPositive, subtitle }: MetricCardProps) {
    return (
        <div className="bg-white border border-slate-50 rounded-2xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <span className="text-slate-500 font-medium text-sm">{title}</span>
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600">
                    {icon}
                </div>
            </div>
            
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{value}</span>
                {trend && (
                    <span className={`text-xs font-medium flex items-center px-1.5 py-0.5 rounded-md ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                        {isPositive ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                        {trend}
                    </span>
                )}
            </div>
            {subtitle && <div className="text-xs text-slate-500 mt-auto pt-2 font-medium">{subtitle}</div>}
        </div>
    );
}
