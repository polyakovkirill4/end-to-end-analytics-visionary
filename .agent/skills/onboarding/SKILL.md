---
name: onboarding
description: Guidelines and standards for implementing interactive product tours and user onboarding in web applications. Includes step-by-step navigation (Next/Prev), target element highlighting (Spotlight), collision-free tooltip positioning, cross-page transitions, and an async element-waiting hook. Use this skill when asked to create, modify, or optimize user onboarding tours or walkthroughs.
---

# Интерактивный онбординг пользователей (Interactive Product Tours)

Этот навык описывает стандарты, алгоритмы и лучшие практики проектирования интерактивных туров (онбординга) для новых пользователей. Используйте его для создания универсальных, адаптивных и надежных пошаговых руководств в любых React/Next.js проектах.

---

## 1. Основные принципы профессионального онбординга

1. **Концентрация внимания (Spotlight Effect)**: 
   * Затемнение остального интерфейса с мягкой подсветкой целевого элемента.
   * Реализуется через CSS `clip-path` (эффект вырезания) или SVG-маску.
2. **Двусторонняя навигация**:
   * Обязательное наличие кнопок **«Назад»** (возврат к предыдущему шагу) и **«Далее»** (переход вперед).
   * Последний шаг должен содержать кнопку **«Завершить»** (или «Начать работу»).
   * Возможность закрыть тур в любой момент по клику на крестик или кнопку «Пропустить».
3. **Адаптивность (Mobile Friendly)**:
   * Тултип онбординга на мобильных устройствах должен автоматически сжиматься по ширине вьюпорта и не выходить за границы экрана.
4. **Визуальная независимость (Темизация)**:
   * **ЗАПРЕЩЕНО** хардкодить цвета. Элементы онбординга (рамки, кнопки, фон тултипа) должны использовать CSS-переменные проекта (например, `var(--primary)`, `var(--background)`) или стандартные утилитарные классы Tailwind CSS, чтобы автоматически наследовать тему приложения.

---

## 2. Межстраничные переходы и асинхронное ожидание (Cross-page Navigation)

В профессиональных приложениях шаги онбординга часто распределены по разным страницам. При переходе на новую страницу целевой элемент появляется не сразу (из-за загрузки чанков, запросов к API и рендеринга).

### Алгоритм ожидания элемента:
1. При переходе на шаг с новым `path` оверлей онбординга временно скрывает тултип и показывает неблокирующий лоадер (или плавно гасит интерфейс).
2. Вызывается программный переход (`router.push(step.path)`).
3. Запускается асинхронный цикл поиска (polling) целевого элемента в DOM (например, каждые 100мс) с максимальным лимитом ожидания (5-10 секунд).
4. Как только элемент найден:
   * Выполняется плавный скролл к нему: `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`.
   * Выдерживается пауза (300-400мс) для завершения анимации прокрутки.
   * Рассчитываются итоговые координаты (`getBoundingClientRect()`) и плавно проявляется тултип.

---

## 3. Математика позиционирования тултипа (Предотвращение коллизий)

Чтобы тултип гарантированно попадал в видимую часть экрана, оверлей должен динамически рассчитывать его координаты относительно целевого элемента и границ экрана.

### Алгоритм расчета позиции:
1. **Определение базовой стороны**:
   * По умолчанию используется `position` из настроек шага (`top`, `bottom`, `left`, `right`).
   * Измеряется свободное место вокруг целевого элемента до краев экрана: `spaceAbove`, `spaceBelow`, `spaceLeft`, `spaceRight`.
   * Если выбранное направление не вмещает тултип (например, `top`, но сверху осталось менее 200px), сторона меняется на противоположную (в данном случае `bottom`), если там свободного места больше.
2. **Корректировка сдвигов (Clipping Prevention)**:
   * Рассчитываются координаты центра тултипа.
   * Если левый край тултипа выходит за пределы экрана (`left - width/2 < minPadding`), координата X сдвигается вправо.
   * Если правый край выходит за рамки экрана (`left + width/2 > window.innerWidth - minPadding`), координата X сдвигается влево.
   * Аналогично проверяются и корректируются верхняя и нижняя границы по оси Y.

---

## 4. Архитектурный пример кода (React + Next.js)

### А. TypeScript интерфейсы и контекст (`OnboardingContext.tsx`)
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface OnboardingStep {
  id: string;
  path: string;            // URL, на котором находится элемент
  targetId: string;        // ID элемента в DOM
  title: string;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: OnboardingStep | null;
  startTour: (steps: OnboardingStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  stopTour: () => void;
  steps: OnboardingStep[];
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const startTour = (tourSteps: OnboardingStep[]) => {
    setSteps(tourSteps);
    setCurrentStepIndex(0);
    setIsActive(true);
    if (pathname !== tourSteps[0].path) {
      router.push(tourSteps[0].path);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (pathname !== steps[nextIdx].path) {
        router.push(steps[nextIdx].path);
      }
    } else {
      stopTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (pathname !== steps[prevIdx].path) {
        router.push(steps[prevIdx].path);
      }
    }
  };

  const stopTour = () => {
    setIsActive(false);
    setCurrentStepIndex(0);
  };

  const currentStep = isActive && steps[currentStepIndex] ? steps[currentStepIndex] : null;

  return (
    <OnboardingContext.Provider value={{ isActive, currentStepIndex, currentStep, startTour, nextStep, prevStep, stopTour, steps }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};
```

### Б. Визуальный оверлей с авто-позиционированием (`OnboardingOverlay.tsx`)
```tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from './OnboardingContext';
import { usePathname } from 'next/navigation';

export const OnboardingOverlay: React.FC = () => {
  const { isActive, currentStep, currentStepIndex, steps, nextStep, prevStep, stopTour } = useOnboarding();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const searchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateCoordinates = () => {
    if (!currentStep) return;

    const element = document.getElementById(currentStep.targetId);
    if (element) {
      setIsSearching(false);
      if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);

      // Плавно скроллим к элементу
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Задержка на завершение скролла перед снятием координат
      setTimeout(() => {
        setTargetRect(element.getBoundingClientRect());
      }, 350);
    } else {
      // Если элемент еще не в DOM (переход на другую страницу / загрузка данных)
      setTargetRect(null);
      setIsSearching(true);

      if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);

      let attempts = 0;
      searchIntervalRef.current = setInterval(() => {
        const retryEl = document.getElementById(currentStep.targetId);
        attempts++;

        if (retryEl) {
          clearInterval(searchIntervalRef.current!);
          setIsSearching(false);
          retryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            setTargetRect(retryEl.getBoundingClientRect());
          }, 350);
        } else if (attempts > 50) { // Лимит 5 секунд
          clearInterval(searchIntervalRef.current!);
          setIsSearching(false);
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (isActive && currentStep) {
      updateCoordinates();
      window.addEventListener('resize', updateCoordinates);
      window.addEventListener('scroll', updateCoordinates, true);
    } else {
      setTargetRect(null);
    }

    return () => {
      window.removeEventListener('resize', updateCoordinates);
      window.removeEventListener('scroll', updateCoordinates, true);
      if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);
    };
  }, [isActive, currentStep, pathname]);

  if (!isActive || !currentStep) return null;

  // Динамический расчет координат тултипа
  let tooltipStyle: React.CSSProperties = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  const minPadding = 16;
  const tooltipWidth = 320;
  const tooltipHeight = 200; // Примерная высота для расчетов

  if (targetRect) {
    const spaceAbove = targetRect.top;
    const spaceBelow = window.innerHeight - targetRect.bottom;
    let isTop = currentStep.position === 'top';

    // Защитный переворот направления при нехватке места
    if (isTop && spaceAbove < tooltipHeight && spaceBelow > spaceAbove) {
      isTop = false;
    } else if (!isTop && spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      isTop = true;
    }

    let top = isTop ? targetRect.top - minPadding : targetRect.bottom + minPadding;
    let left = targetRect.left + targetRect.width / 2;
    let translateY = isTop ? '-100%' : '0';

    // Корректировка по горизонтали (чтобы тултип не уезжал за края экрана)
    const halfWidth = tooltipWidth / 2;
    if (left - halfWidth < minPadding) {
      left = minPadding + halfWidth;
    } else if (left + halfWidth > window.innerWidth - minPadding) {
      left = window.innerWidth - minPadding - halfWidth;
    }

    // Корректировка по вертикали
    if (isTop && top - tooltipHeight < minPadding) {
      top = minPadding + tooltipHeight;
    } else if (!isTop && top + tooltipHeight > window.innerHeight - minPadding) {
      top = window.innerHeight - minPadding - tooltipHeight;
      translateY = '0';
    }

    tooltipStyle = {
      top,
      left,
      transform: `translate(-50%, ${translateY})`,
      width: `${tooltipWidth}px`
    };
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none transition-all">
      {/* Затемнение с эффектом Spotlight */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        style={{
          clipPath: targetRect
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left - 8}px 100%, ${targetRect.left - 8}px ${targetRect.top - 8}px, ${targetRect.right + 8}px ${targetRect.top - 8}px, ${targetRect.right + 8}px ${targetRect.bottom + 8}px, ${targetRect.left - 8}px ${targetRect.bottom + 8}px, ${targetRect.left - 8}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />

      {/* Окантовка активной зоны (использует цвета темы через border-primary) */}
      {targetRect && (
        <div
          className="absolute border-2 border-primary rounded-lg pointer-events-none transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Состояние поиска элемента на новой странице */}
      {isSearching && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border rounded-lg p-4 shadow-xl pointer-events-auto flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground">Загрузка шага...</span>
        </div>
      )}

      {/* Панель тултипа */}
      {targetRect && !isSearching && (
        <div
          className="absolute bg-card border rounded-xl shadow-2xl p-5 pointer-events-auto transition-all duration-300"
          style={tooltipStyle}
        >
          {/* Заголовок */}
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-foreground text-base leading-tight">{currentStep.title}</h4>
            <button
              onClick={stopTour}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent"
              aria-label="Закрыть"
            >
              &times;
            </button>
          </div>

          {/* Описание */}
          <p className="text-muted-foreground text-xs md:text-sm mb-4 leading-relaxed">
            {currentStep.text}
          </p>

          {/* Навигация */}
          <div className="flex items-center justify-between mt-4">
            {/* Точки прогресса */}
            <div className="flex space-x-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${idx === currentStepIndex ? 'w-4 bg-primary' : 'w-1.5 bg-border'}`}
                />
              ))}
            </div>

            {/* Кнопки управления */}
            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-accent transition-colors"
                >
                  Назад
                </button>
              )}
              <button
                onClick={nextStep}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                {isLastStep ? 'Завершить' : 'Далее'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 5. Чек-лист проверки ИИ-агента (Self-Check List)

Перед завершением внедрения или модификации системы онбординга ИИ-агент **обязан** проверить следующие пункты:

- [ ] **Двусторонняя навигация**: Доступна ли кнопка «Назад» на всех шагах, кроме первого? Меняется ли кнопка на «Завершить» на последнем шаге?
- [ ] **Темизация**: Отсутствуют ли в стилях захардкоженные цвета (типа `#1e3a8a` или `bg-slate-900`)? Используются ли Tailwind-переменные или CSS-токены темы (`bg-card`, `border-primary`, `text-primary-foreground`)?
- [ ] **Безопасность вьюпорта**: Проверяется ли высота экрана перед позиционированием? Переворачивается ли тултип, если элемент находится слишком близко к верхнему или нижнему краю?
- [ ] **Асинхронные переходы**: Есть ли лоадер на время ожидания появления целевого ID? Ограничен ли таймаут поиска элемента (не зависает ли бесконечный интервал, если элемент так и не появился)?
- [ ] **Сброс при уходе**: Сбрасывается ли состояние онбординга, если пользователь вручную кликнул по меню и ушел в другой раздел, не завершив тур?
