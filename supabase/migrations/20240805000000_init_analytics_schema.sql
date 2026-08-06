-- ========================================================
-- Базовая архитектура для B2B SaaS (Организации, Профили, Проекты)
-- ========================================================

-- 1. Таблица: Профили пользователей
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Таблица: Организации (Компании / Команды)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Таблица: Участники организаций
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- Роли: 'owner', 'admin', 'member'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- ========================================================
-- Аналитика: Проекты и Данные
-- ========================================================

-- 4. Таблица: Проекты (теперь привязаны к ОРГАНИЗАЦИИ)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    api_key UUID UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Индексы
CREATE INDEX idx_projects_api_key ON projects(api_key);
CREATE INDEX idx_projects_org_id ON projects(organization_id);

-- 5. Таблица: Сессии (Посещения)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer TEXT,
    landing_page TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_sessions_project_client ON sessions(project_id, client_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);

-- 6. Таблица: Просмотры страниц (Pageviews)
CREATE TABLE pageviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    page_url TEXT NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_pageviews_session_id ON pageviews(session_id);

-- 7. Таблица: Лиды и Продажи (Leads / Deals)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    client_id TEXT,
    crm_lead_id TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'won', 'lost'
    revenue DECIMAL(12,2) DEFAULT 0.0,
    currency TEXT DEFAULT 'RUB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_leads_project_id ON leads(project_id);

-- 8. Таблица: Расходы на рекламу (Ad Costs)
CREATE TABLE ad_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    utm_source TEXT NOT NULL,
    utm_medium TEXT,
    utm_campaign TEXT,
    cost DECIMAL(12,2) DEFAULT 0.0,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    currency TEXT DEFAULT 'RUB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, date, utm_source, utm_medium, utm_campaign)
);

CREATE INDEX idx_ad_costs_project_date ON ad_costs(project_id, date);

-- ========================================================
-- Автоматизация: Триггеры для регистрации
-- ========================================================

-- Функция автоматического создания профиля и дефолтной организации при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- 1. Создаем профиль пользователя
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- 2. Создаем дефолтную организацию "Моя компания"
  INSERT INTO public.organizations (name)
  VALUES ('Моя компания')
  RETURNING id INTO new_org_id;
  
  -- 3. Добавляем пользователя как владельца (owner) в организацию
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, new.id, 'owner');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Привязываем триггер к таблице auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================
-- Безопасность RLS (Row Level Security)
-- ========================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_costs ENABLE ROW LEVEL SECURITY;

-- Профили: Пользователь может читать и обновлять только свой профиль
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Участники организации: Пользователь видит только свои записи (во избежание рекурсии)
CREATE POLICY "Users can view own membership" ON organization_members FOR SELECT 
    USING (user_id = auth.uid());

-- Организации: Пользователь видит только свои организации
CREATE POLICY "Users can view their orgs" ON organizations FOR SELECT 
    USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Проекты: Пользователь может работать с проектами своей организации
CREATE POLICY "Users can manage projects of their orgs" ON projects FOR ALL 
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Данные (Сессии, Лиды, Расходы): Доступ только к данным проектов своей организации
CREATE POLICY "Users can view sessions" ON sessions FOR SELECT 
    USING (project_id IN (SELECT id FROM projects WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can view pageviews" ON pageviews FOR SELECT 
    USING (session_id IN (SELECT id FROM sessions WHERE project_id IN (SELECT id FROM projects WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))));

CREATE POLICY "Users can manage leads" ON leads FOR ALL 
    USING (project_id IN (SELECT id FROM projects WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage ad_costs" ON ad_costs FOR ALL 
    USING (project_id IN (SELECT id FROM projects WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));
