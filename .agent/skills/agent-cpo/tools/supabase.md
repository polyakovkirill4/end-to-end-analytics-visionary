# Инструмент: Supabase (БД)

Описывает, как работать с базой данных проекта для извлечения продуктовых метрик (DAU/MAU, Retention, Feature Adoption).

## Доступные данные
В базе данных хранятся таблицы, полезные для продуктового анализа:
- `users` (когорты по дате регистрации)
- `events` / `activity_logs` (действия пользователей, клики, использование фичей)
- `sessions` (сессии пользователей)

## Типовые SQL-запросы для CPO

### 1. DAU / MAU (Активные пользователи)
Ежедневные и ежемесячные активные пользователи (по логам авторизации или активности):
```sql
-- DAU за сегодня
SELECT count(DISTINCT user_id) as dau
FROM activity_logs
WHERE created_at >= current_date;

-- MAU за текущий месяц
SELECT count(DISTINCT user_id) as mau
FROM activity_logs
WHERE created_at >= date_trunc('month', current_date);
```

### 2. Feature Adoption (Использование конкретной фичи)
Сколько уникальных пользователей воспользовалось фичей `export_report` за последнюю неделю:
```sql
SELECT count(DISTINCT user_id) as users_used_feature
FROM events
WHERE event_name = 'export_report' 
  AND created_at >= current_date - interval '7 days';
```

### 3. Классический Retention (Удержание 1-го, 7-го, 30-го дня)
Нужно построить когортный отчет или посчитать конкретный день для когорты.
```sql
-- Пример: Retention 7-го дня для пользователей, зарегистрировавшихся 8 дней назад
WITH cohort AS (
  SELECT id FROM users WHERE date(created_at) = current_date - interval '8 days'
)
SELECT 
  (SELECT count(*) FROM cohort) as cohort_size,
  (SELECT count(DISTINCT user_id) FROM activity_logs 
   WHERE date(created_at) = current_date - interval '1 day' 
     AND user_id IN (SELECT id FROM cohort)) as retained_users;
```

## Как использовать
CPO использует эти запросы, чтобы проверять продуктовые гипотезы данными (Data-Informed), оценивать «прилипчивость» (Stickiness) фичей и принимать решения об их доработке или удалении.
