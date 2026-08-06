import { clsx } from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down';
  trendValue: string;
  trendText: string;
}

export function StatCard({ title, value, trend, trendValue, trendText }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col gap-4">
      <h3 className="text-slate-600 font-medium text-lg">{title}</h3>
      <div className="text-[40px] font-bold text-[#4B0082] leading-none tracking-tight">
        {value}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2">
        <div 
          className={clsx(
            "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-semibold",
            trend === 'up' 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          )}
        >
          {trend === 'up' ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {trendValue}
        </div>
        <span className="text-sm text-slate-500 font-medium">{trendText}</span>
      </div>
    </div>
  );
}
