---
trigger: model_decision
description: Техническое описание проекта (стек, конфиг)
---

# Обзор проекта

Проект: SaaS-платформа по бизнес-аналитике Visionary.
Стек: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Supabase.
Фронтенд: Next.js (React + TypeScript, Server & Client Components).
Бэкенд: Next.js (API Routes / App Router Route Handlers).
База данных: Supabase Database (PostgreSQL).
Авторизация: Supabase Auth.
Хранилище (Storage): Supabase Storage.
Хостинг: Vercel.
Конфигурация: Next.js config (без использования Vite).
Локальное окружение: Node.js v24.11.0.
Контроль версий: Git локально, интеграция с GitHub.
Правила ИИ-агентов: Папка `.agent/rules`.
Skills ИИ-агентов: Папка `.agent/skills`.
Рабочие процессы ИИ-агентов: Папка `.agent/workflows`.
Документация по проекту: Папка `docs`.
PWA приложение, в будущем сделаем кроссплатформенное мобильное приложение.

Основные библиотеки проекта:
- `@tanstack/react-query` — кэширование и работа с сервером.
- `zustand` — глобальное состояние UI.
- `react-hook-form` + `zod` — работа с формами и валидация.
- `motion` — анимации.
- `lucide-react` — иконки.

Особенности сборки и разработки:
- Используй переиспользуемые UI-компоненты.
- Используй утилиты и хелперы (например, форматирование из `@/utils/formatters.ts`).
- Библиотеки и MCP: Используй MCP Context7 для актуализации данных о версиях и особенностях работы современных веб-библиотек.