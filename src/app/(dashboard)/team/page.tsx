import { createClient } from '@/lib/supabase/server';
import { Users, Mail, Shield, Trash2, Plus, UserPlus } from 'lucide-react';
import { inviteMember, changeRole, removeMember } from './actions';
import { revalidatePath } from 'next/cache';

export default async function TeamPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: currentMember } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(name)')
        .eq('user_id', user.id)
        .single();

    if (!currentMember) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed text-slate-500 min-h-[300px]">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Организация не найдена</h3>
            <p className="text-sm">Вы не состоите ни в одной организации.</p>
        </div>
    );

    const isOrgAdmin = currentMember.role === 'owner' || currentMember.role === 'admin';
    const isOwner = currentMember.role === 'owner';
    const organizations = currentMember.organizations as unknown as {name: string};
    const orgName = organizations?.name || 'Моя компания';

    const { data: members } = await supabase
        .from('organization_members')
        .select(`
            id,
            role,
            created_at,
            user_id,
            profiles (
                email,
                first_name,
                last_name
            )
        `)
        .eq('organization_id', currentMember.organization_id)
        .order('created_at', { ascending: true });


    return (
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-10">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Команда</h1>
                    <p className="text-slate-500 text-[15px] mt-1.5">
                        Управляйте доступами к рабочему пространству «{orgName}».
                    </p>
                </div>

                {isOrgAdmin && (
                    <details className="group relative">
                        <summary className="list-none cursor-pointer flex items-center gap-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-purple-500/20 select-none">
                            <UserPlus className="w-4 h-4" />
                            Пригласить в команду
                        </summary>
                        <div className="absolute right-0 top-[calc(100%+12px)] z-50 bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] w-[360px] cursor-default">
                            <h3 className="text-lg font-bold text-slate-900 mb-5">Новый участник</h3>
                            <form action={inviteMember} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="email" className="text-xs font-semibold text-slate-700">Email коллеги</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="colleague@example.com"
                                            className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] text-sm transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="role" className="text-xs font-semibold text-slate-700">Роль</label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="w-full bg-[#F5F3FA] border-0 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] text-sm transition-all appearance-none"
                                    >
                                        <option value="member">Участник</option>
                                        <option value="admin">Администратор</option>
                                    </select>
                                </div>
                                <button type="submit" className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white py-3 rounded-xl text-sm font-medium transition-colors shadow-md shadow-purple-500/20 mt-2">
                                    Отправить приглашение
                                </button>
                                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                                    Пользователю будет отправлено письмо со ссылкой на регистрацию в вашем рабочем пространстве.
                                </p>
                            </form>
                        </div>
                    </details>
                )}
            </div>

            <div className="bg-white border border-slate-100/60 rounded-[24px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Пользователь</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Роль</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Присоединился</th>
                                {isOrgAdmin && <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Действия</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {members?.map((m: any) => {
                                const profile = m.profiles;
                                const isSelf = m.user_id === user.id;
                                const canManage = isOrgAdmin && !isSelf && (isOwner || m.role !== 'owner');

                                return (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                                                    {profile?.email?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.email}
                                                        {isSelf && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">Вы</span>}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{profile?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5">
                                                {m.role === 'owner' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100/50"><Shield className="w-3 h-3" /> Владелец</span>}
                                                {m.role === 'admin' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/50"><Shield className="w-3 h-3" /> Администратор</span>}
                                                {m.role === 'member' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200/50">Участник</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                                            {new Date(m.created_at).toLocaleDateString('ru-RU')}
                                        </td>
                                        {isOrgAdmin && (
                                            <td className="py-4 px-6 text-right">
                                                {canManage ? (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <form action={changeRole}>
                                                            <input type="hidden" name="memberId" value={m.id} />
                                                            <input type="hidden" name="newRole" value={m.role === 'admin' ? 'member' : 'admin'} />
                                                            <button
                                                                type="submit"
                                                                className="text-xs font-medium text-slate-500 hover:text-[#6D28D9] px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                                                            >
                                                                {m.role === 'admin' ? 'Понизить' : 'Назначить админом'}
                                                            </button>
                                                        </form>
                                                        <form action={removeMember}>
                                                            <input type="hidden" name="memberId" value={m.id} />
                                                            <button
                                                                type="submit"
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Удалить из команды"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </form>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Нет доступа</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
