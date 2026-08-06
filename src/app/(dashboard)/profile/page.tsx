import { createClient } from '@/lib/supabase/server';
import { Building, LogOut } from 'lucide-react';
import Link from 'next/link';
import { updateProfile, updateOrganization } from './actions';
import { signOut } from '@/app/(auth)/actions';

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Получаем профиль
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Получаем организацию
    const { data: member } = await supabase
        .from('organization_members')
        .select('role, organizations(name)')
        .eq('user_id', user.id)
        .single();

    const organizations = member?.organizations as unknown as {name: string};
    const orgName = organizations?.name || 'Нет организации';
    const orgRole = member?.role || 'Нет роли';
    const isOrgAdmin = orgRole === 'owner' || orgRole === 'admin';

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8 w-full">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Личный кабинет</h1>
                    <p className="text-slate-500 text-sm mt-1">Управление личным профилем и настройками организации</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/projects" className="text-slate-700 font-medium hover:bg-slate-50 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm">
                        Вернуться к проектам
                    </Link>
                    <form action={signOut}>
                        <button type="submit" className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium hover:bg-red-50 transition-colors bg-white border border-red-200 px-4 py-2 rounded-xl text-sm cursor-pointer">
                            <LogOut className="w-4 h-4" />
                            Выйти
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Редактирование личных данных */}
                <div className="bg-white border border-slate-100/50 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-6">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                        <div className="w-12 h-12 rounded-full bg-[#6D28D9] flex items-center justify-center text-xl font-bold text-white shadow-md shadow-purple-500/20">
                            {profile?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Личные данные</h2>
                            <span className="text-slate-500 text-xs">{profile?.email}</span>
                        </div>
                    </div>

                    <form action={updateProfile} className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Имя</label>
                            <input 
                                type="text" 
                                name="firstName" 
                                defaultValue={profile?.first_name || ''} 
                                className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm transition-all"
                                placeholder="Введите имя"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Фамилия</label>
                            <input 
                                type="text" 
                                name="lastName" 
                                defaultValue={profile?.last_name || ''} 
                                className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm transition-all"
                                placeholder="Введите фамилию"
                            />
                        </div>
                        <button type="submit" className="mt-2 w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white p-3 rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-md shadow-purple-500/20">
                            Сохранить изменения
                        </button>
                    </form>
                </div>

                {/* Данные организации */}
                <div className="bg-white border border-slate-100/50 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                        <Building className="text-[#6D28D9]" size={20} />
                        Рабочее пространство
                    </h2>

                    <form action={updateOrganization} className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Название компании</label>
                            <input 
                                type="text" 
                                name="orgName" 
                                defaultValue={orgName} 
                                disabled={!isOrgAdmin}
                                className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-500"
                                placeholder="Моя компания"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Ваша роль</label>
                            <input 
                                type="text" 
                                value={orgRole === 'owner' ? 'Владелец (Owner)' : orgRole === 'admin' ? 'Администратор' : 'Участник'} 
                                disabled
                                className="w-full bg-slate-50 border-0 rounded-xl py-3 px-4 text-slate-500 sm:text-sm cursor-not-allowed"
                            />
                        </div>
                        {isOrgAdmin ? (
                            <button type="submit" className="mt-2 w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white p-3 rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-md shadow-purple-500/20">
                                Переименовать компанию
                            </button>
                        ) : (
                            <p className="text-xs text-slate-500 italic mt-4">Только администраторы могут изменять настройки компании.</p>
                        )}
                    </form>
                </div>


            </div>

        </div>
    );
}
