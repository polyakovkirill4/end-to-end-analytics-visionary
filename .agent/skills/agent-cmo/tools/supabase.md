# Инструмент: Supabase (БД)

Описывает, как работать с базой данных проекта для извлечения маркетинговых метрик (источники трафика, конверсии, реферальные связи).

## Доступные данные
В базе данных хранятся таблицы, полезные для маркетингового анализа:
- `users` / `profiles` (информация о пользователях, дата регистрации)
- `utm_tags` или поля `utm_source`, `utm_medium` в таблице пользователей (источники привлечения)
- `referrals` (реферальные связи)

## Типовые SQL-запросы для CMO

### 1. Анализ источников трафика (Acquisition)
Сколько пользователей пришло с каждого канала за последний месяц:
```sql
SELECT utm_source, count(*) as signups
FROM users
WHERE created_at >= date_trunc('month', current_date)
GROUP BY utm_source
ORDER BY signups DESC;
```

### 2. Конверсия Trial → Paid
Какая доля пользователей, зарегистрировавшихся месяц назад, перешла на платный тариф:
```sql
WITH cohort AS (
  SELECT id FROM users
  WHERE created_at >= current_date - interval '60 days'
    AND created_at < current_date - interval '30 days'
)
SELECT 
  (SELECT count(*) FROM cohort) as total_signups,
  (SELECT count(DISTINCT user_id) FROM subscriptions WHERE status = 'active' AND user_id IN (SELECT id FROM cohort)) as paid_users;
```

### 3. Реферальная программа
Топ пользователей, пригласивших больше всего новых клиентов:
```sql
SELECT referrer_id, count(*) as invited_count
FROM users
WHERE referrer_id IS NOT NULL
GROUP BY referrer_id
ORDER BY invited_count DESC
LIMIT 10;
```

## Как использовать
CMO должен использовать эти запросы (через CLI или запрашивая у пользователя) для подтверждения гипотез о каналах привлечения, конверсиях и качестве лидов.
