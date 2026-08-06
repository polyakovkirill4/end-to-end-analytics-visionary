'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('profiles')
        .update({ 
            first_name: firstName || null, 
            last_name: lastName || null 
        })
        .eq('id', user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/profile');
}

export async function updateOrganization(formData: FormData) {
    const orgName = formData.get('orgName') as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Находим организацию пользователя, где он является владельцем (owner) или админом (admin)
    const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single();

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new Error('Permission denied');
    }

    const { error } = await supabase
        .from('organizations')
        .update({ name: orgName })
        .eq('id', member.organization_id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/profile');
}
