---
name: ai-chat-openrouter
description: Руководство по интеграции ИИ-чата на базе OpenRouter API в веб-приложение, включая проектирование API Route Handler, управление сообщениями и адаптивный UI-интерфейс чата с индикацией загрузки и выбором моделей.
---

# Интеграция ИИ-чата через OpenRouter

Этот навык содержит архитектурные стандарты, примеры кода и лучшие практики для реализации полнофункционального ИИ-чата с использованием агрегатора моделей OpenRouter в приложениях на React и Next.js.

## 1. Архитектура решения

Схема взаимодействия компонентов:
1. **Клиентская часть (React/Next.js)**: управление состоянием диалога, отображение сообщений с учетом ролей (user/assistant), отправка текста, обработка лоудеров и ошибок, выбор активной модели.
2. **Серверная часть (Next.js API Route)**: проксирование запросов к OpenRouter, хранение и применение API-ключа из переменных окружения (`process.env`), обработка ошибок API-провайдера.

---

## 2. Реализация Серверной Части (API Route Handler)

Для безопасности API-ключ **никогда** не должен передаваться на клиент. Запросы к OpenRouter выполняются через серверный обработчик.

Создайте файл `src/app/api/chat/route.ts`:

```typescript
import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  model?: string;
}

export async function POST(req: Request) {
  try {
    const { messages, model }: ChatRequestBody = await req.json();
    
    // Выбор модели по умолчанию, если не передана с клиента
    const selectedModel = model || 'google/gemma-4-31b-it:free';

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Ошибка конфигурации: отсутствует OPENROUTER_API_KEY');
      return NextResponse.json(
        { error: 'Сервер не настроен для работы с ИИ (отсутствует API-ключ)' },
        { status: 500 }
      );
    }

    // Запрос к OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // Рекомендуемые заголовки OpenRouter для ранжирования
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'My SaaS Analytics Platform',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка от OpenRouter API:', errorText);
      return NextResponse.json(
        { error: `Ошибка ИИ-провайдера: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;

    if (!assistantMessage) {
      throw new Error('Пустой ответ от API-модели');
    }

    return NextResponse.json({ message: assistantMessage });

  } catch (error: any) {
    console.error('Критическая ошибка API-обработчика чата:', error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера при обработке чата' },
      { status: 500 }
    );
  }
}
```

---

## 3. Реализация Клиентской Части (UI & State)

Интерфейс чата должен быть отзывчивым, поддерживать блокировку кнопок при загрузке, выводить ошибки с понятным оформлением и поддерживать прокрутку к последнему сообщению.

### Строгие типы данных:
```typescript
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIModel {
  id: string;
  name: string;
}
```

### Основные компоненты и UX-паттерны:
1. **Контейнер с фиксированной высотой**: Чат должен занимать всю отведенную ему высоту родителя с независимой внутренней прокруткой списка сообщений.
2. **Селектор моделей**: Удобное переключение между доступными ИИ-моделями (например, бесплатными для тестов или премиальными).
3. **Автоматический скролл**: После добавления нового сообщения или во время генерации ответа контейнер должен плавно прокручиваться вниз. Для этого используйте `useRef` на пустой блок внизу списка:
   ```typescript
   const messagesEndRef = useRef<HTMLDivElement>(null);
   
   const scrollToBottom = () => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   };
   
   useEffect(() => {
     scrollToBottom();
   }, [messages, isLoading]);
   ```
4. **Обработка ошибок**: При возникновении ошибки на сервере (например, лимиты запросов или невалидный ключ) UI должен отображать блок ошибки красного/розового цвета с подробным описанием и кнопкой повтора.
5. **Предотвращение повторных отправок**: Кнопка отправки и инпут должны блокироваться (`disabled={isLoading}`) на время выполнения сетевого запроса.

---

## 4. Пример клиентского компонента React

```tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { Message, AIModel } from './types';

const MODELS: AIModel[] = [
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B (Free)' },
  { id: 'openrouter/free', name: 'Auto-Router (Free)' },
];

export default function AIChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setErrorMsg('');
    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, model: selectedModel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Ошибка сервера: ${response.status}`);
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Не удалось отправить сообщение. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Селектор модели */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">ИИ Консультант</span>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Окно сообщений */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-white">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6">
            <p className="text-xs text-slate-400 max-w-xs">
              Задайте любой вопрос ИИ-ассистенту. История сообщений не сохраняется после перезагрузки страницы.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white ml-auto rounded-tr-none shadow-sm'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
              }`}
            >
              {msg.content}
            </div>
          ))
        )}

        {isLoading && (
          <div className="bg-slate-100 border border-slate-200/50 text-slate-500 p-3.5 rounded-2xl max-w-[85%] rounded-tl-none text-xs animate-pulse">
            Думаю над ответом...
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-150 text-rose-600 p-3.5 rounded-2xl max-w-[85%] text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
            <div>
              <strong>Ошибка:</strong> {errorMsg}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Форма ввода */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напишите сообщение..."
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Отправить</span>
        </button>
      </form>
    </div>
  );
}
```
