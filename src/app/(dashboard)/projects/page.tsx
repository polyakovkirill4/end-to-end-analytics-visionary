import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Briefcase, Settings, Pencil, Trash2, Shield, Key, Plus } from 'lucide-react';

// Server Action для создания нового проекта
async function createProject(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const domain = formData.get('domain') as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (!member) throw new Error('Organization not found');

    const { error } = await supabase.from('projects').insert({
        name,
        domain,
        organization_id: member.organization_id
    });

    if (error) throw new Error(error.message);
    revalidatePath('/projects');
}

export default async function ProjectsPage() {
    const supabase = await createClient();

    const { data: projects } = await supabase
        .from('projects')
        .select('id, name, domain, api_key, created_at')
        .order('created_at', { ascending: false });

    return (
    <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-10">
      
      {/* Шапка страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Управление проектами</h1>
          <p className="text-slate-500 text-[15px] mt-1.5">Добавляйте проекты и настраивайте доступы для команды.</p>
        </div>

        {/* Форма создания (спрятана под details для имитации модалки без JS) */}
        <details className="group relative">
          <summary className="list-none cursor-pointer flex items-center gap-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-purple-500/20 select-none">
            <Plus className="w-4 h-4" />
            Создать проект
          </summary>
          <div className="absolute right-0 top-[calc(100%+12px)] z-50 bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] w-[360px] cursor-default">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Новый проект</h3>
            <form action={createProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-slate-700">Название (например, Блог)</label>
                <input id="name" name="name" type="text" required className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] text-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="domain" className="text-xs font-semibold text-slate-700">Домен (example.com)</label>
                <input id="domain" name="domain" type="text" className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] text-sm transition-all" />
              </div>
              <button type="submit" className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white py-3 rounded-xl text-sm font-medium transition-colors shadow-md shadow-purple-500/20 mt-2">Добавить проект</button>
            </form>
          </div>
        </details>
      </div>

      {/* Список существующих проектов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <div key={project.id} className="bg-white border border-slate-100/60 rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] flex flex-col gap-6 relative group overflow-hidden">
            {/* Декоративный фон */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50/50 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-125 duration-700 pointer-events-none"></div>

            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-4">
                <Link href={`/projects/${project.id}/overview`} className="w-12 h-12 rounded-[14px] bg-[#F5F3FA] flex items-center justify-center text-[#6D28D9] hover:bg-[#EBE7F5] transition-colors">
                  <Briefcase className="w-6 h-6" />
                </Link>
                <div>
                  <Link href={`/projects/${project.id}/overview`} className="text-[17px] font-bold text-slate-900 hover:text-[#6D28D9] transition-colors">{project.name}</Link>
                  <p className="text-slate-500 text-[11px] font-medium mt-0.5">Создано: {new Date(project.created_at).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Активен
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-slate-50/80 rounded-xl p-3.5 flex flex-col gap-1.5 border border-slate-100/50">
                <span className="text-[11px] text-slate-500 font-medium">Моя роль</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Shield className="w-4 h-4 text-[#6D28D9]" />
                  Администратор
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-3.5 flex flex-col gap-1.5 border border-slate-100/50">
                <span className="text-[11px] text-slate-500 font-medium">API Ключ</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Key className="w-4 h-4 text-blue-500" />
                  <span className="truncate max-w-[100px]" title={project.api_key}>{project.api_key}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10 pt-2">
               <Link href={`/projects/${project.id}/overview`} className="text-[13px] font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
                  Открыть дашборд
               </Link>
               <div className="flex items-center justify-end gap-1">
                 <Link href={`/projects/${project.id}/settings`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Настройки">
                   <Settings className="w-4 h-4" />
                 </Link>
                 <button className="p-2 text-slate-400 hover:text-[#6D28D9] hover:bg-[#F5F3FA] rounded-lg transition-colors cursor-pointer" title="Редактировать">
                   <Pencil className="w-4 h-4" />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Удалить">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        ))}

        {(!projects || projects.length === 0) && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed text-slate-500 min-h-[300px]">
             <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-1">У вас пока нет проектов</h3>
             <p className="text-sm">Создайте первый проект, нажав кнопку выше.</p>
          </div>
        )}
      </div>
    </div>
    );
}