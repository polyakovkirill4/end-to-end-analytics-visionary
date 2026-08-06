'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart2, 
  Target, 
  Users, 
  Banknote, 
  Puzzle,
  Settings,
  UserCircle,
  Briefcase
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const menuItems = [
  { name: 'Дашборд', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Мои проекты', href: '/projects', icon: Briefcase },
  { name: 'Сквозная аналитика', href: '/analytics', icon: BarChart2 },
  { name: 'Источники трафика', href: '/traffic', icon: Target },
  { name: 'Лиды', href: '/leads', icon: Users },
  { name: 'Продажи', href: '/sales', icon: Banknote },
  { name: 'Интеграции', href: '/integrations', icon: Puzzle },
];

const bottomItems = [
  { name: 'Настройки', href: '/settings', icon: Settings },
  { name: 'Мой профиль', href: '/profile', icon: UserCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white flex flex-col transition-transform">
      <div className="flex h-20 items-center px-6 border-b border-transparent">
        <Link href="/" className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-[#4B0082]">Аналитика</span>
          <span className="text-xs text-slate-500 font-medium">Сквозной сервис</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={twMerge(
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              )}
            >
              <Icon className={clsx('w-5 h-5 transition-transform duration-200 group-hover:scale-110', isActive ? 'text-white' : 'text-slate-500')} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 flex flex-col gap-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={twMerge(
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              )}
            >
              <Icon className={clsx('w-5 h-5 transition-transform duration-200 group-hover:scale-110', isActive ? 'text-white' : 'text-slate-500')} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
