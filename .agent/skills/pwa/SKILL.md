---
name: pwa-skill
description: Правила и лучшие практики разработки PWA приложения. Используй при работе с кэшированием, офлайн-режимом и мобильной адаптацией PWA.
---

# PWA Skill

Этот навык устанавливает стандарты и пошаговые инструкции для настройки, сборки и обеспечения корректной работы Progressive Web App (PWA) в проекте.

---

## 1. Базовая настройка PWA (Чтобы приложение работало)

Для сборки и запуска приложения как PWA используются три основных компонента: **Плагин Vite**, **Манифест** и **Мета-теги**.

### А. Настройка сборщика (`vite.config.ts`)
Для генерации Service Worker (`sw.js`) при сборке используется плагин `vite-plugin-pwa`.
*   **Правило настройки**:
    *   `registerType: 'autoUpdate'` — автоматически обновляет SW при выходе новой версии приложения.
    *   `injectRegister: 'inline'` — автоматически встраивает скрипт регистрации SW в собранный `index.html` (не нужно писать скрипт регистрации вручную в `index.tsx`).
    *   `workbox.globPatterns` — определяет, какие статические ресурсы кэшируются сразу при установке приложения.
    *   `workbox.runtimeCaching` — настраивает стратегии кэширования для внешних запросов (шрифты, иконки, сторонние библиотеки).

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Предварительное кэширование статики
        runtimeCaching: [
          {
            // Кэширование CDN шрифтов и стилей Font Awesome
            urlPattern: /^https:\/\/(cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              }
            }
          }
        ]
      },
      manifest: false // Указывает плагину использовать статический manifest.json
    })
  ]
});
```

### Б. Web App Manifest (`public/manifest.json`)
Манифест сообщает мобильной операционной системе о том, что веб-сайт является приложением и может быть установлен на рабочий стол.
*   **Правило**: Манифест должен лежать в `/public/manifest.json`, содержать правильные пути к иконкам и корректные настройки отображения:
    *   `display: "standalone"` — скрывает интерфейс браузера.
    *   `orientation: "portrait"` — фиксирует ориентацию на мобильных.
    *   `icons.purpose: "maskable any"` — позволяет корректно масштабировать иконки на Android (поддержка круглых/квадратных рамок).

```json
{
  "name": "Progressive Web App",
  "short_name": "PWA",
  "description": "Progressive Web Application",
  "start_url": "/summary",
  "display": "standalone",
  "background_color": "#f9fafb",
  "theme_color": "#a31f34",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "maskable any"
    }
  ]
}
```

### В. Подключение и мета-теги в `index.html`
Чтобы браузер распознал PWA и адаптировал интерфейс под iOS/Android, пропишите мета-теги в `<head>`:
```html
<!-- Viewport для предотвращения зума на мобильных -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="theme-color" content="#a31f34" />

<!-- iOS PWA поддержка -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/icon-512x512.png">

<!-- Подключение манифеста -->
<link rel="manifest" href="/manifest.json">
```

---

## 2. Специфика верстки под мобильный UX PWA

Для достижения нативного UX необходимо соблюдать правила верстки:
1.  **Размер шрифта input >= 16px** (`text-base`):
    *   Если у полей ввода (`input`, `textarea`, `select`) на iOS размер шрифта меньше 16px, система автоматически увеличивает страницу (Zoom-эффект), что ломает верстку.
    *   *Всегда* делайте шрифт полей ввода на мобильных устройствах не менее `16px`.
2.  **Безопасные зоны (Safe Areas)**:
    *   Все закрепленные элементы (нижнее меню `MobileBottomMenu.tsx`, Bottom Sheets, плавающие кнопки) должны учитывать вырезы экранов:
        *   Tailwind: `pb-[env(safe-area-inset-bottom)]`.
3.  **Сенсорные цели (Touch Targets)**:
    *   Все кликабельные элементы (кнопки, иконки, чекбоксы) должны иметь размер не менее `44x44px` для удобного нажатия пальцем.

---

## 3. Дополнительно: Офлайн-режим (Offline-First)

Офлайн-режим строится на комбинации кэширования динамических GET-запросов на чтение, накопления оффлайн-мутаций (запись CUD) в IndexedDB и последующей синхронизации при восстановлении сети.

### А. Кэширование GET-запросов (Чтение)
При наличии сети данные запрашиваются из Supabase и сохраняются в IndexedDB. При отсутствии сети приложение считывает данные из IndexedDB, предотвращая падение интерфейса.

*Пример типизированной IndexedDB схемы для кэша:*
```typescript
import { openDB, DBSchema } from 'idb';
import { isOnline } from '../utils/pwa';
import { supabase } from '../services/supabaseClient';

export interface CachedLesson {
    id: string; // Обязательно для keyPath
    title: string;
    start: string;
    end: string;
    [key: string]: unknown;
}

export interface AppOfflineDB extends DBSchema {
    'cached-lessons': {
        key: string;
        value: CachedLesson;
    };
}

const getDB = () => openDB<AppOfflineDB>('app-offline', 1);

export const getLessonsWithCache = async (): Promise<CachedLesson[]> => {
    const db = await getDB();
    if (isOnline()) {
        const { data, error } = await supabase.from('lessons').select('*');
        if (error) throw error;

        // Перезаписываем оффлайн-кэш в IndexedDB
        const tx = db.transaction('cached-lessons', 'readwrite');
        await tx.store.clear();
        for (const lesson of data || []) {
            await tx.store.put(lesson as CachedLesson);
        }
        await tx.done;
        return data as CachedLesson[];
    } else {
        // Читаем из локальной IndexedDB
        return await db.getAll('cached-lessons');
    }
};
```

### Б. Офлайн-мутации (Запись)
Для записи оффлайн-действий в проекте реализован мутатор в `lib/offlineMutator.ts` (функция `mutate`).
*   Если сети нет и запущено PWA, `mutate` записывает операцию (`insert`, `update`, `delete`) в хранилище IndexedDB `sync-queue` и возвращает флаг `{ offline: true }`.
*   *Всегда используйте `mutate` вместо прямого `supabase.from()` для операций, поддерживающих автономность.*

```typescript
import { mutate } from '../lib/offlineMutator';

const handleSaveAttendance = async (clientId: string, lessonId: string, status: string) => {
    const result = await mutate({
        table: 'attendance',
        operation: 'upsert',
        payload: {
            id: `${clientId}_${lessonId}`,
            client_id: clientId,
            lesson_id: lessonId,
            status: status,
            updated_at: new Date().toISOString()
        }
    });
};
```

### В. Связь с UI (React State & Custom Events)
При восстановлении сети хук `useOfflineSync.ts` запускает синхронизацию.
Чтобы сообщить остальным React-компонентам, что данные обновились, генерируется Custom Event, на который подписываются хуки:
```typescript
// В хуке синхронизации:
window.dispatchEvent(new CustomEvent('offline-sync-completed', { detail: { syncedCount } }));

// В UI хуке (например, useCalendarData.ts):
useEffect(() => {
    const handleSync = () => loadData(false, true); // Перезагружаем стейт с сервера
    window.addEventListener('offline-sync-completed', handleSync);
    return () => window.removeEventListener('offline-sync-completed', handleSync);
}, [loadData]);
```

### Г. Разрешение конфликтов (Conflict Resolution)
*   **Стратегия Last Write Wins (LWW)**: Все мутации применяются по `timestamp` их создания.
*   При ошибках дубликатов (например, `duplicate key`) запись удаляется из очереди (`await remove(item.id)`), так как на сервере уже есть аналогичная актуальная запись.
*   **Критические блокировки**: Финансовые операции (оплата, списание) при отсутствии сети блокируются (`disabled={!isOnline()}`).
