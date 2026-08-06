import { clsx } from 'clsx';

const data = [
  {
    channel: 'Яндекс Директ',
    color: 'bg-yellow-400',
    impressions: '150 000',
    clicks: '4 500',
    ctr: '3.0%',
    leads: '150',
    cpl: '800 ₽',
    sales: '30',
    revenue: '600 000 ₽',
    spend: '120 000 ₽',
    profit: '480 000 ₽',
    profitColor: 'text-[#6D28D9]',
    roas: '500%',
    roasColor: 'text-green-500',
    roi: '400%',
    roiColor: 'text-green-500'
  },
  {
    channel: 'VK Ads',
    color: 'bg-blue-500',
    impressions: '200 000',
    clicks: '3 000',
    ctr: '1.5%',
    leads: '90',
    cpl: '1 000 ₽',
    sales: '15',
    revenue: '300 000 ₽',
    spend: '90 000 ₽',
    profit: '210 000 ₽',
    profitColor: 'text-[#6D28D9]',
    roas: '333%',
    roasColor: 'text-green-500',
    roi: '233%',
    roiColor: 'text-green-500'
  },
  {
    channel: 'Google Ads',
    color: 'bg-red-500',
    impressions: '80 000',
    clicks: '2 400',
    ctr: '3.0%',
    leads: '80',
    cpl: '1 250 ₽',
    sales: '20',
    revenue: '400 000 ₽',
    spend: '100 000 ₽',
    profit: '300 000 ₽',
    profitColor: 'text-[#6D28D9]',
    roas: '400%',
    roasColor: 'text-green-500',
    roi: '300%',
    roiColor: 'text-green-500'
  }
];

const total = {
    impressions: '430 000',
    clicks: '9 900',
    ctr: '2.3%',
    leads: '320',
    cpl: '968 ₽',
    sales: '65',
    revenue: '1 300 000 ₽',
    spend: '310 000 ₽',
    profit: '990 000 ₽',
    roas: '419%',
    roi: '319%'
};

export function AnalyticsTable() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 mt-6 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100/80">
        <h3 className="text-xl font-bold text-slate-900">Сводные данные по каналам</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-[#F8F5FF] text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4 text-left font-medium">Канал</th>
              <th className="px-4 py-4 font-medium">Показы</th>
              <th className="px-4 py-4 font-medium">Клики</th>
              <th className="px-4 py-4 font-medium">CTR</th>
              <th className="px-4 py-4 font-medium">Лиды</th>
              <th className="px-4 py-4 font-medium">CPL</th>
              <th className="px-4 py-4 font-medium">Продажи</th>
              <th className="px-4 py-4 font-medium">Выручка</th>
              <th className="px-4 py-4 font-medium">Расход</th>
              <th className="px-4 py-4 font-medium">Прибыль</th>
              <th className="px-4 py-4 font-medium">ROAS</th>
              <th className="px-6 py-4 font-medium">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5 text-left font-medium text-slate-900 flex items-center gap-3">
                  <div className={clsx("w-2 h-2 rounded-full", row.color)}></div>
                  {row.channel}
                </td>
                <td className="px-4 py-5 text-slate-600">{row.impressions}</td>
                <td className="px-4 py-5 text-slate-600">{row.clicks}</td>
                <td className="px-4 py-5 text-slate-600">{row.ctr}</td>
                <td className="px-4 py-5 text-slate-600">{row.leads}</td>
                <td className="px-4 py-5 text-slate-600">{row.cpl}</td>
                <td className="px-4 py-5 text-slate-600">{row.sales}</td>
                <td className="px-4 py-5 text-slate-900">{row.revenue}</td>
                <td className="px-4 py-5 text-slate-600">{row.spend}</td>
                <td className={clsx("px-4 py-5 font-semibold", row.profitColor)}>{row.profit}</td>
                <td className={clsx("px-4 py-5 font-medium", row.roasColor)}>{row.roas}</td>
                <td className={clsx("px-6 py-5 font-medium", row.roiColor)}>{row.roi}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#F3E8FF]">
            <tr>
              <td className="px-6 py-5 text-left font-bold text-slate-900">Итого</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.impressions}</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.clicks}</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.ctr}</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.leads}</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.cpl}</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.sales}</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.revenue}</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.spend}</td>
              <td className="px-4 py-5 font-bold text-[#6D28D9]">{total.profit}</td>
              <td className="px-4 py-5 font-bold text-slate-900">{total.roas}</td>
              <td className="px-6 py-5 font-bold text-slate-900">{total.roi}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
