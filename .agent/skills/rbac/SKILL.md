---
name: rbac
description: Guidelines and standards for implementing dynamic Role-Based Access Control (RBAC) in React and Next.js applications. Includes dynamic DB schema design, database-to-client permission loading, frontend Guards, route protection, PostgreSQL RLS policies, and a step-by-step implementation guide. Use this skill when asked to design, implement, or modify roles, permissions, and access levels in a project.
---

# Динамическое управление доступом на основе ролей (Dynamic RBAC)

Этот навык описывает стандарты и архитектурные паттерны для реализации **динамической** системы контроля доступа на основе ролей (RBAC), поддерживающей **как B2B (Организации), так и B2C (Глобальные пользователи)** модели.

Система позволяет администраторам создавать абсолютно новые, уникальные роли в процессе работы приложения (помимо стандартных), гибко настраивать для них права и привязывать пользователей к ролям (в рамках конкретной организации или глобально) без необходимости изменения исходного кода.

---

## 1. Архитектура базы данных (PostgreSQL / Supabase)

В динамической системе RBAC связи между пользователями, ролями и правами (разрешениями) хранятся в БД. Для поддержки B2B (мультитенантности) связь пользователя и роли включает `organization_id`. Если проект чисто B2C, `organization_id` остается `NULL` (глобальная роль).

```
[auth.users] (id)                 [public.organizations] (id)
      │                                 │
      ▼                                 ▼
[public.user_roles] (user_id, role_id, organization_id)
      │
      ▼
[public.roles] (id, name, is_system) ───[public.role_permissions] (role_id, permission_id)
                                                                 │
                                                                 ▼
                                                  [public.permissions] (id, key)
```

### SQL-миграция для структуры таблиц:

```sql
-- 1. Справочник прав (Permissions) — список всех защищаемых действий в системе
CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key varchar(100) UNIQUE NOT NULL, -- Уникальный строковый ключ (например, 'users:create')
    name varchar(100) NOT NULL,        -- Человекочитаемое название
    description text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Таблица ролей (Roles)
CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(50) UNIQUE NOT NULL,        -- Системное имя (например, 'owner', 'custom_manager')
    display_name varchar(100) NOT NULL,      -- Отображаемое имя (например, 'Менеджер филиала')
    description text,
    is_system boolean DEFAULT false NOT NULL, -- true для встроенных базовых ролей, которые нельзя удалять
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Связующая таблица: какие права принадлежат каким ролям
CREATE TABLE public.role_permissions (
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Связующая таблица: какие роли назначены пользователям (B2B и B2C)
CREATE TABLE public.user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL для глобальных ролей (B2C)
    PRIMARY KEY (user_id, role_id, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'))
);

-- Включение RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

---

## 2. Загрузка прав на клиенте и Интеграция с RLS

Чтобы права работали корректно и безопасно как на бэкенде (RLS), так и на фронтенде, мы используем RPC функцию, которая вычисляет права пользователя **с учетом текущей организации**.

### А. SQL-функция (RPC) для вычисления прав
```sql
CREATE OR REPLACE FUNCTION public.get_my_permissions(p_org_id uuid DEFAULT NULL)
RETURNS TABLE(permission_key varchar) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.key
  FROM public.permissions p
  JOIN public.role_permissions rp ON p.id = rp.permission_id
  JOIN public.user_roles ur ON rp.role_id = ur.role_id
  WHERE ur.user_id = auth.uid()
    -- Право активно, если оно выдано в текущей организации ИЛИ является глобальным (NULL)
    AND (ur.organization_id = p_org_id OR ur.organization_id IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Б. PostgreSQL RLS с учетом организации
В политиках RLS мы передаем ID организации текущей строки в функцию:
```sql
CREATE POLICY "Users with settings:write in org can update" 
ON public.organization_settings 
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.get_my_permissions(organization_id) p
    WHERE p.permission_key = 'settings:write'
  )
);
```

---

## 3. Защита роутов на бэкенде (Middleware & JWT)

**🚨 КРИТИЧЕСКОЕ ПРАВИЛО:** Хранить плоский массив прав (`user-permissions`) в сырых куках — **небезопасно** и подвержено лимиту браузера (4KB). 

Для защиты роутов в `middleware.ts` используйте **один из двух правильных паттернов**:
1. **Supabase Custom Claims**: Использовать `supabase.auth.getUser()`, предварительно настроив PostgreSQL триггер, который зашивает права (или хотя бы роль пользователя) прямо в JWT токен `auth.users.raw_app_meta_data`.
2. **Серверный кэш**: В `middleware.ts` делать серверный запрос к `get_my_permissions` и кэшировать его (например, в Redis, или использовать React `cache` в Layout).

Пример концепта защиты (Middleware):
```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Инициализация supabase SSR...
  const { data: { user } } = await supabase.auth.getUser();
  
  // Пример проверки через Custom Claims в JWT (где app_metadata.permissions обновляется триггером)
  const permissions = user?.app_metadata?.permissions || [];
  
  if (request.nextUrl.pathname.startsWith('/settings') && !permissions.includes('settings:access')) {
     return NextResponse.redirect(new URL('/403', request.url));
  }
  return NextResponse.next();
}
```

---

## 4. Проверка прав на фронтенде (React & Next.js)

Проверка прав в коде независима от ролей. Мы проверяем конкретное действие: "может ли юзер сделать X?".

### А. Компонент `<Guard>` с Empty State (`@/components/shared/Guard.tsx`)
Если у пользователя нет прав, мы не просто возвращаем пустой экран. По умолчанию мы показываем красивую заглушку с призывом к действию.

```tsx
import React from 'react';
import { useAccess } from '@/hooks/useAccess';
import { LockIcon } from 'lucide-react'; // Любая библиотека иконок

interface GuardProps {
  permission?: string;
  anyPermissions?: string[];
  fallback?: React.ReactNode; 
  hideFallback?: boolean; // Если true, рендерит null вместо Empty State (для скрытия кнопок)
  children: React.ReactNode;
}

export function Guard({ permission, anyPermissions, fallback, hideFallback = false, children }: GuardProps) {
  const { check, checkAny, isLoading } = useAccess();

  if (isLoading) return null; // Скелетон

  const hasAccess = (permission && check(permission)) || (anyPermissions && checkAny(anyPermissions));

  if (!hasAccess) {
    if (hideFallback) return null;
    if (fallback) return <>{fallback}</>;
    
    // Стандартный Empty State для секций и страниц
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-gray-200 rounded-lg w-full">
        <div className="p-3 bg-red-100 text-red-600 rounded-full mb-4">
          <LockIcon size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Доступ ограничен</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          У вас недостаточно прав для просмотра этого раздела. Обратитесь к владельцу рабочего пространства для повышения уровня доступа.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
```

*Пример использования:*
```tsx
{/* Скрываем кнопку, если нет прав (без fallback) */}
<Guard permission="users:create" hideFallback>
  <button className="btn-primary">Пригласить сотрудника</button>
</Guard>

{/* Показываем красивый блок с ошибкой вместо страницы */}
<Guard permission="billing:manage">
  <BillingDashboard />
</Guard>
```

---

## 5. Панель управления (Создание уникальных кастомных ролей)

В системе изначально закладываются **4 базовые системные роли** (`is_system = true`):
1. `owner` (Владелец) — полный доступ.
2. `admin` (Администратор) — управление, кроме биллинга и удаления воркспейса.
3. `member` (Участник) — стандартный функционал.
4. `viewer` (Читатель) — только просмотр (Read-Only).

Но главное преимущество динамического RBAC — возможность создания **любых уникальных ролей**.

### Функционал интерфейса Администратора:
1. **Конструктор ролей**: Кнопка "Создать роль". Пользователь вводит любое название (например, "Менеджер по отчетам"). Запись уходит в таблицу `roles`.
2. **Матрица прав (Permissions Matrix)**:
   * Интерфейс, где можно выбрать созданную роль и отметить галочками, какие права (из таблицы `permissions`) ей доступны.
   * При клике на Checkbox, API добавляет/удаляет связку в `role_permissions`.
3. **Управление командой**: При приглашении сотрудника (или в его профиле), администратор выбирает для него любую из системных или кастомных ролей (создает запись в `user_roles` с привязкой к `organization_id`).

---

## ✅ Пошаговый чек-лист внедрения для ИИ-Агента

При задаче интеграции или модификации ролей:
- [ ] **Миграция БД**: Развернуть таблицы `permissions`, `roles`, `role_permissions`, `user_roles` с поддержкой `organization_id`.
- [ ] **Seed Данных**: Создать скрипт для базовых прав (`analytics:view`, и т.д.) и 4 системных ролей (`owner`, `admin`, `member`, `viewer`).
- [ ] **SQL Функция**: Написать RPC `get_my_permissions(org_id)` с учетом мультитенантности (B2B и B2C fallback).
- [ ] **RLS**: Настроить политики безопасности таблиц на базе `get_my_permissions`.
- [ ] **Middleware**: Настроить проверку защищенных страниц через Custom Claims JWT или серверный запрос (не использовать сырые куки для прав!).
- [ ] **UI Guard**: Внедрить компонент `<Guard>` с красивым Empty State ("Обратитесь к владельцу").
- [ ] **Интерфейс Ролей**: Реализовать UI создания кастомных ролей (любое название) и Матрицу прав (чекбоксы).
