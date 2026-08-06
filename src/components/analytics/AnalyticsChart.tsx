'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const data = [
  { name: '01 Мар', leads: 40, sales: 20 },
  { name: '08 Мар', leads: 60, sales: 25 },
  { name: '15 Мар', leads: 110, sales: 50 },
  { name: '22 Мар', leads: 50, sales: 25 },
  { name: '30 Мар', leads: 130, sales: 65 },
];

export function AnalyticsChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 mt-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-900">Динамика Лидов и Продаж</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6D28D9]"></div>
            <span className="text-sm font-medium text-slate-600">Лиды</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C4B5FD] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-slate-600">Продажи</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              hide={true} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="leads" 
              stroke="#6D28D9" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, fill: '#6D28D9', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#C4B5FD" 
              strokeWidth={3}
              strokeDasharray="5 5" 
              dot={false}
              activeDot={{ r: 6, fill: '#C4B5FD', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
