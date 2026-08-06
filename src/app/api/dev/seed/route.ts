import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const { projectId } = await req.json();
        if (!projectId) {
            return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
        }

        // Очищаем старые данные проекта перед сидированием, чтобы можно было перезапускать скрипт
        await supabaseAdmin.from('ad_costs').delete().eq('project_id', projectId);
        await supabaseAdmin.from('leads').delete().eq('project_id', projectId);
        await supabaseAdmin.from('sessions').delete().eq('project_id', projectId);

        // Список источников трафика для генерации
        const channels = [
            { source: 'yandex', medium: 'cpc', campaigns: ['poisk_brand', 'seti_rsya', 'retargeting_leads'] },
            { source: 'google', medium: 'cpc', campaigns: ['search_competitors', 'pmax_products'] },
            { source: 'vk', medium: 'cpc', campaigns: ['lookalike_la', 'interest_marketing'] },
            { source: 'telegram', medium: 'cpm', campaigns: ['channels_business', 'dev_blogs'] },
            { source: 'direct', medium: null, campaigns: [null] },
            { source: 'organic', medium: 'referral', campaigns: [null] }
        ];

        const now = new Date();
        const sessionsToInsert = [];
        const costsToInsert = [];
        
        // Генерируем данные за последние 30 дней
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // 1. Генерация расходов на рекламу (для платных каналов)
            channels.forEach(ch => {
                if (ch.source !== 'direct' && ch.source !== 'organic') {
                    ch.campaigns.forEach(camp => {
                        if (!camp) return;
                        // Стоимость за день от 500 до 6000 рублей
                        const cost = Math.floor(Math.random() * 5500) + 500;
                        const impressions = Math.floor(cost * (Math.random() * 4 + 4)); // Показы
                        const clicks = Math.floor(impressions * (Math.random() * 0.06 + 0.01)); // Клики (CTR 1-7%)

                        costsToInsert.push({
                            project_id: projectId,
                            date: dateStr,
                            utm_source: ch.source,
                            utm_medium: ch.medium,
                            utm_campaign: camp,
                            cost: cost,
                            impressions: impressions,
                            clicks: clicks,
                            currency: 'RUB'
                        });
                    });
                }
            });

            // 2. Генерация сессий (кликов/визитов на сайт) за день
            const dailySessionCount = Math.floor(Math.random() * 25) + 15; // 15-40 сессий в день
            for (let s = 0; s < dailySessionCount; s++) {
                const randomCh = channels[Math.floor(Math.random() * channels.length)];
                const randomCamp = randomCh.campaigns[Math.floor(Math.random() * randomCh.campaigns.length)];
                const clientId = 'vs_seed_' + Math.random().toString(36).substring(2, 12);

                const sessionTime = new Date(date);
                sessionTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

                sessionsToInsert.push({
                    project_id: projectId,
                    client_id: clientId,
                    utm_source: randomCh.source,
                    utm_medium: randomCh.medium,
                    utm_campaign: randomCamp,
                    referrer: randomCh.source === 'direct' ? null : `https://${randomCh.source}.com`,
                    landing_page: 'https://example.com/',
                    ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    created_at: sessionTime.toISOString()
                });
            }
        }

        // Загружаем сессии в базу
        const { data: createdSessions, error: sessionsError } = await supabaseAdmin
            .from('sessions')
            .insert(sessionsToInsert)
            .select('id, client_id, created_at');

        if (sessionsError || !createdSessions) {
            throw new Error(sessionsError?.message || 'Failed to create sessions');
        }

        // Загружаем расходы на рекламу
        const { error: costsError } = await supabaseAdmin
            .from('ad_costs')
            .insert(costsToInsert);
        if (costsError) throw new Error(costsError.message);

        // 3. Генерация просмотров страниц (Pageviews) для каждой сессии
        const pageviewsToInsert: any[] = [];
        createdSessions.forEach(session => {
            pageviewsToInsert.push({
                session_id: session.id,
                page_url: 'https://example.com/',
                time_spent_seconds: Math.floor(Math.random() * 90) + 10,
                created_at: session.created_at
            });

            // Часть пользователей переходит на другие страницы
            if (Math.random() > 0.4) {
                const viewTime = new Date(session.created_at);
                viewTime.setSeconds(viewTime.getSeconds() + 30);
                pageviewsToInsert.push({
                    session_id: session.id,
                    page_url: 'https://example.com/pricing',
                    time_spent_seconds: Math.floor(Math.random() * 120) + 15,
                    created_at: viewTime.toISOString()
                });
            }
        });

        const { error: pageviewsError } = await supabaseAdmin
            .from('pageviews')
            .insert(pageviewsToInsert);
        if (pageviewsError) throw new Error(pageviewsError.message);

        // 4. Генерация лидов и сделок (Leads / Deals)
        const leadsToInsert = [];
        const statuses = ['new', 'in_progress', 'won', 'lost'];
        
        // Сделаем около 35 лидов на весь объем сессий (~5% конверсия)
        const leadCount = 35;
        for (let l = 0; l < leadCount; l++) {
            const randomSession = createdSessions[Math.floor(Math.random() * createdSessions.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            // Если сделка успешна (won), то генерируем выручку от 10k до 150k рублей
            const revenue = status === 'won' ? (Math.floor(Math.random() * 140000) + 10000) : 0;

            const leadTime = new Date(randomSession.created_at);
            leadTime.setMinutes(leadTime.getMinutes() + Math.floor(Math.random() * 45) + 5);

            leadsToInsert.push({
                project_id: projectId,
                session_id: randomSession.id,
                client_id: randomSession.client_id,
                crm_lead_id: 'deal_' + Math.floor(Math.random() * 900000 + 100000),
                status: status,
                revenue: revenue,
                currency: 'RUB',
                created_at: leadTime.toISOString(),
                updated_at: leadTime.toISOString()
            });
        }

        const { error: leadsError } = await supabaseAdmin
            .from('leads')
            .insert(leadsToInsert);
        if (leadsError) throw new Error(leadsError.message);

        return NextResponse.json({
            success: true,
            seeded: {
                sessions: sessionsToInsert.length,
                ad_costs_records: costsToInsert.length,
                pageviews: pageviewsToInsert.length,
                leads: leadsToInsert.length
            }
        });

    } catch (err: any) {
        console.error('Seeding error:', err);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
