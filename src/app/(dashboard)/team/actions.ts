'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function checkAdminRights(supabase: any, userId: string) {
    const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', userId)
        .single();

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new Error('У вас нет прав для выполнения этого действия');
    }

    return member;
}

export async function inviteMember(formData: FormData) {
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    if (role !== 'member' && role !== 'admin') {
        throw new Error('Недопустимая роль');
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Не авторизован');

    const adminMember = await checkAdminRights(supabase, user.id);

    // В реальном приложении здесь будет логика создания инвайт-токена в таблицу invitations
    // и отправка письма через провайдер (Resend/SendGrid/etc).
    // Для мок-демонстрации мы можем попробовать найти пользователя по email и добавить его,
    // если он существует, или просто сымитировать успешное отправление приглашения.

    const { data: profileToInvite } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (profileToInvite) {
        // Пользователь уже зарегистрирован, добавляем его в организацию напрямую
        const { error } = await supabase
            .from('organization_members')
            .insert({
                organization_id: adminMember.organization_id,
                user_id: profileToInvite.id,
                role: role
            });

        if (error) {
             console.error("Ошибка при добавлении пользователя:", error);
             // Игнорируем ошибку уникальности (уже состоит) для демо
        }
    } else {
        // Здесь мы бы сохраняли в таблицу invitations: { email, organization_id, role, token }
        console.log(`Симуляция: Отправлено приглашение на ${email} с ролью ${role}`);
    }

    revalidatePath('/team');
}

export async function changeRole(formData: FormData) {
    const memberId = formData.get('memberId') as string;
    const newRole = formData.get('newRole') as string;

    if (newRole !== 'member' && newRole !== 'admin') {
        throw new Error('Недопустимая роль');
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Не авторизован');

    const adminMember = await checkAdminRights(supabase, user.id);

    const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .eq('organization_id', adminMember.organization_id) // Защита от IDOR
        .neq('user_id', user.id) // Нельзя менять роль себе
        .neq('role', 'owner'); // Нельзя менять роль владельца через это действие

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/team');
}

export async function removeMember(formData: FormData) {
    const memberId = formData.get('memberId') as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Не авторизован');

    const adminMember = await checkAdminRights(supabase, user.id);

    const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', adminMember.organization_id) // Защита от удаления из чужой организации
        .neq('user_id', user.id) // Нельзя удалить самого себя
        .neq('role', 'owner'); // Нельзя удалить владельца

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/team');
}
