import Link from 'next/link';
import { LayoutDashboard, Megaphone, Link as LinkIcon, Settings, ChevronLeft, LogOut } from 'lucide-react';
import DateRangePicker from '@/components/filters/DateRangePicker';
import { signOut } from '@/app/(auth)/actions';

export default async function ProjectLayout(props: {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>;
}) {
    const params = await props.params;
    
    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                        V
                    </div>
                    <span className="font-bold text-lg tracking-tight">Visionary</span>
                </div>
                
                <div className="p-4 border-b border-slate-800">
                    <Link href="/projects" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={16} />
                        Все проекты
                    </Link>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <Link 
                        href={`/projects/${params.projectId}/overview`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors text-slate-300 hover:text-white group"
                    >
                        <LayoutDashboard size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium text-sm">Дашборд</span>
                    </Link>
                    
                    <Link 
                        href={`/projects/${params.projectId}/campaigns`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors text-slate-300 hover:text-white group"
                    >
                        <Megaphone size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium text-sm">Кампании</span>
                    </Link>

                    <Link 
                        href={`/projects/${params.projectId}/integrations`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors text-slate-300 hover:text-white group"
                    >
                        <LinkIcon size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium text-sm">Интеграции</span>
                    </Link>

                    <Link 
                        href={`/projects/${params.projectId}/settings`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors text-slate-300 hover:text-white group"
                    >
                        <Settings size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium text-sm">Настройки</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
                    <form action={signOut}>
                        <button 
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium cursor-pointer"
                        >
                            <LogOut size={18} />
                            Выйти
                        </button>
                    </form>
                    <div className="text-xs text-slate-500 text-center mt-1">
                        Visionary Analytics v0.1
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                    <h2 className="font-medium text-slate-300">Аналитика проекта</h2>
                    <DateRangePicker />
                </header>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {props.children}
                    </div>
                </div>
            </main>
        </div>
    );
}
