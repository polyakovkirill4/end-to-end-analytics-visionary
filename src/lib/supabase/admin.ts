import { createClient } from '@supabase/supabase-js';

export const getSupabaseAdmin = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:5432',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'test'
    );
};
