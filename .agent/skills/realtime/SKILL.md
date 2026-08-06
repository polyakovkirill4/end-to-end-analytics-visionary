---
name: realtime-websockets
description: Правила интеграции Realtime обновлений (Supabase Realtime) и WebSockets. Используй при реализации чатов, живых расписаний и мгновенных уведомлений.
---

# Realtime & WebSockets Integration Skill

Этот навык определяет стандарты для работы с живыми данными и двухсторонним обменом сообщениями в реальном времени, адаптированные под текущую архитектуру проекта.

В проекте реализовано два типа живого взаимодействия:
1. **Supabase Realtime (WebSockets via Supabase)** — используется для внутреннего мессенджера (чаты, сообщения, статусы прочтения) и системы глобальных уведомлений.
2. **Socket.io-client** — используется точечно для интеграции с внешними сервисами, а именно для получения счетчиков непрочитанных из Wazzup24 (интеграция WhatsApp/Telegram).

---

## 1. Использование Supabase Realtime

Supabase Realtime используется для автоматического обновления чатов, сообщений и уведомлений без перезагрузки страниц. 

> [!IMPORTANT]
> В нашем проекте **не используется** React Query (TanStack Query) для управления серверным стейтом чатов. Все обновления обрабатываются вручную через локальный React-стейт (`useState`), хуки (`useCallback`, `useEffect`) и рефы (`useRef`), что обеспечивает гибкость при работе с Optimistic UI и сложной логикой мессенджера.

### Основные правила:
1. **Единый клиент**: Всегда импортируйте `supabase` из `services/supabaseClient`.
2. **Использование Refs для стабильности**: Чтобы Realtime-подписка не перезапускалась при каждом изменении активного чата или списка пользователей, сохраняйте их в `useRef` (например, `activeChatIdRef.current = activeChatId`) и обращайтесь к ним внутри обработчика событий сокета.
3. **Очистка каналов**: Всегда удаляйте канал в функции очистки `useEffect` через `supabase.removeChannel(channel)`.
4. **Синхронизация через Custom Events**: Используйте стандартные события браузера (`window.dispatchEvent` и `window.addEventListener`) для передачи состояний между независимыми компонентами (например, обновление глобального счетчика непрочитанных при прочтении сообщений внутри страницы чата).

### Шаблон подписки на мессенджер в React (по типу `useMessenger`):
```typescript
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Message, Chat } from '../types/messenger';

export const useMessengerRealtime = (activeChatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    const channel = supabase
      .channel('messenger-main-channel')
      // 1. Слушаем новые сообщения
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messenger_messages' },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.chat_id === activeChatIdRef.current) {
            setMessages((prev) => {
              // Дедупликация (для Optimistic UI)
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      // 2. Слушаем обновления сообщений (редактирование, soft-delete)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messenger_messages' },
        (payload) => {
          const updated = payload.new;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Пустой массив зависимостей, подписка стабильна благодаря refs
};
```

---

## 2. Интеграция WebSockets через Socket.io

Socket.io используется в проекте исключительно для интеграции с Wazzup24 (отслеживание счетчиков сообщений WhatsApp/Telegram в реальном времени).

### Правила работы с Socket.io-client в проекте:
1. **Локальный реф для сокета**: Инстанс сокета хранится в `useRef` (`socketRef.current`) внутри хука, чтобы избежать множественных подключений при ререндерах.
2. **Динамическая конфигурация**: Настройки подключения (хост, API-ключ) должны запрашиваться асинхронно через соответствующий сервис перед инициализацией (например, `getWazzupCountersConfig()`).
3. **Отложенный старт**: Чтобы не замедлять первоначальную загрузку приложения, инициализацию веб-сокета рекомендуется откладывать на несколько секунд (например, через `setTimeout` на 5 секунд).
4. **Жизненный цикл**: Обязательно подписывайтесь на события `'connect'`, `'counterUpdate'`, `'connect_error'` и `'disconnect'`, а при размонтировании вызывайте `socket.disconnect()`.

### Пример интеграции Socket.io (по типу `useWazzupCount`):
```typescript
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getWazzupCountersConfig } from '../services/wazzupService';

export const useWazzupCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: any;

    const initSocket = async () => {
      try {
        const { host, apiKey } = await getWazzupCountersConfig();
        if (!isMounted) return;

        const socket = io(`https://${host}`, {
          path: '/ws-counters/',
          transports: ['websocket', 'polling']
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('counterConnecting', {
            type: 'api_v3',
            apiKey,
            userId: 'user-id'
          });
        });

        socket.on('counterUpdate', (data) => {
          const count = data.counterV2 !== undefined ? data.counterV2 : data.counter;
          if (isMounted) setUnreadCount(count || 0);
        });

        socket.on('disconnect', (reason) => {
          if (reason === 'io server disconnect') {
            socket.connect();
          }
        });
      } catch (err) {
        console.warn('Wazzup counters integration is currently unavailable:', err);
      }
    };

    timeoutId = setTimeout(initSocket, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return unreadCount;
};
```

---

## 3. Предотвращение дублирования и бесконечных циклов

* **Optimistic UI и Дедупликация**: При отправке сообщения в стейт сразу добавляется временное сообщение с префиксом `temp-` в ID. При получении реального сообщения через Realtime-канал проверяется совпадение отправителя и контента (или ID), чтобы предотвратить дублирование и красиво заменить временное сообщение на постоянное.
* **Фильтрация по отправителю**: В глобальных счетчиках (например, `useMessengerUnreadCount`) обновление количества непрочитанных должно происходить только в том случае, если отправителем сообщения является другой пользователь (`payload.new.sender_id !== user.id`). Это исключает лишние расчеты при собственных отправках.
