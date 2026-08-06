import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface DateRange {
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
}

export async function getProjectMetrics(projectId: string, dateRange?: DateRange) {
    // В реальном проекте здесь мы строим динамические SQL запросы (через Supabase RPC для скорости),
    // но для начала собираем данные через базовые запросы
    
    let costsQuery = getSupabaseAdmin().from('ad_costs').select('*').eq('project_id', projectId);
    let sessionsQuery = getSupabaseAdmin().from('sessions').select('id, utm_source').eq('project_id', projectId);
    let leadsQuery = getSupabaseAdmin().from('leads').select('id, status, revenue').eq('project_id', projectId);

    if (dateRange) {
        costsQuery = costsQuery.gte('date', dateRange.from).lte('date', dateRange.to);
        sessionsQuery = sessionsQuery.gte('created_at', `${dateRange.from}T00:00:00Z`).lte('created_at', `${dateRange.to}T23:59:59Z`);
        leadsQuery = leadsQuery.gte('created_at', `${dateRange.from}T00:00:00Z`).lte('created_at', `${dateRange.to}T23:59:59Z`);
    }

    const [
        { data: costs },
        { data: sessions },
        { data: leads }
    ] = await Promise.all([
        costsQuery,
        sessionsQuery,
        leadsQuery
    ]);

    // Базовая агрегация
    const totalCost = costs?.reduce((acc, curr) => acc + Number(curr.cost), 0) || 0;
    const totalTraffic = sessions?.length || 0;
    const totalLeads = leads?.length || 0;
    
    const sales = leads?.filter(l => l.status === 'won') || [];
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((acc, curr) => acc + Number(curr.revenue), 0);

    // Бизнес-метрики
    const cpl = totalLeads > 0 ? totalCost / totalLeads : 0; // Cost Per Lead
    const cac = totalSales > 0 ? totalCost / totalSales : 0; // Customer Acquisition Cost
    const romi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0; // Return on Marketing Investment
    const conversionRate = totalTraffic > 0 ? (totalLeads / totalTraffic) * 100 : 0;

    return {
        totalCost,
        totalTraffic,
        totalLeads,
        totalSales,
        totalRevenue,
        cpl,
        cac,
        romi,
        conversionRate
    };
}
