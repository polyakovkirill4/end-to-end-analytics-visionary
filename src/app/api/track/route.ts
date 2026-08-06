import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { apiKey, clientId, pageUrl, referrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, userAgent } = body;

        if (!apiKey || !clientId || !pageUrl) {
            return NextResponse.json({ error: 'Missing parameters' }, { 
                status: 400,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        // 1. Поиск проекта по API-ключу
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .select('id')
            .eq('api_key', apiKey)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: 'Invalid API Key' }, { 
                status: 401,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        // 2. Поиск существующей сессии (по куке)
        let { data: session } = await supabaseAdmin
            .from('sessions')
            .select('id')
            .eq('project_id', project.id)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // 3. Создаем новую сессию, если её нет, или если пришли новые UTM-метки
        const hasNewUtm = utmSource || utmCampaign;
        
        if (!session || hasNewUtm) {
            const { data: newSession, error: sessionError } = await supabaseAdmin
                .from('sessions')
                .insert({
                    project_id: project.id,
                    client_id: clientId,
                    utm_source: utmSource || null,
                    utm_medium: utmMedium || null,
                    utm_campaign: utmCampaign || null,
                    utm_term: utmTerm || null,
                    utm_content: utmContent || null,
                    referrer: referrer || null,
                    landing_page: pageUrl,
                    user_agent: userAgent || null
                })
                .select('id')
                .single();
                
            if (sessionError) throw new Error(sessionError.message);
            session = newSession;
        }

        // 4. Фиксация просмотра страницы (Pageview)
        await supabaseAdmin.from('pageviews').insert({
            session_id: session.id,
            page_url: pageUrl
        });

        return NextResponse.json(
            { success: true, sessionId: session.id }, 
            { headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    } catch (err: any) {
        console.error('Tracking Error:', err);
        return NextResponse.json(
            { error: 'Server error' }, 
            { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    }
}

// Поддержка CORS (Preflight запросов) от браузера
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}