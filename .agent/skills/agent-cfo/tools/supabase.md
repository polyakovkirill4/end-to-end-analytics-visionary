# Инструмент: Supabase (БД)

Описывает, как работать с базой данных проекта (PostgreSQL) для извлечения финансовых метрик (MRR, Churn, ARPU).

## Доступные данные
В базе данных (PostgreSQL) хранятся таблицы, связанные с финансами:
- `subscriptions` (подписки, тарифы, статусы)
- `payments` (транзакции, возвраты)
- `invoices` (счета)

## Типовые SQL-запросы для CFO

### 1. Расчет MRR (Monthly Recurring Revenue)
Нужно суммировать стоимость всех активных подписок в текущем месяце.
```sql
SELECT SUM(price) as mrr
FROM subscriptions
WHERE status = 'active';
```

### 2. Расчет Churn (Отток клиентов)
Нужно найти подписки, которые были отменены в текущем месяце.
```sql
SELECT count(*) as churned_users
FROM subscriptions
WHERE status = 'canceled' AND canceled_at >= date_trunc('month', current_date);
```

### 3. Расчет ARPU (Средний чек)
```sql
SELECT AVG(price) as arpu
FROM subscriptions
WHERE status = 'active';
```

## Как использовать
Если тебе нужно проверить финансовую гипотезу или посчитать Unit-экономику, ты можешь использовать инструмент `run_command` для выполнения SQL-запросов к Supabase через CLI (если он настроен) или попросить пользователя выполнить эти запросы и вернуть тебе результат.
