---
name: dashboard-builder
description: Инструкции и стандарты для разработки интерактивного конструктора дашбордов (Dashboard Builder) с возможностью создания, настройки, перетаскивания (Drag-and-Drop) и изменения размеров виджетов на холсте.
---

# Конструктор дашбордов (Dashboard Builder)

Этот навык устанавливает стандарты и паттерны проектирования для создания интерактивных конструкторов дашбордов с возможностью drag-and-drop перетаскивания и нативного изменения размера виджетов на холсте.

## 1. Структура Данных (TypeScript модели)

Основой гибкого конструктора является правильная структура данных, разделяющая визуальное позиционирование (Layout) и бизнес-настройки виджета (Configuration).

```typescript
export type ChartType = 'line' | 'bar' | 'pie' | 'heading' | 'text' | 'table';
export type WidgetColor = 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber' | 'sky';

/** Позиция и размер виджета на холсте (в пикселях или относительных колонках) */
export interface WidgetLayout {
  id: string;
  x: number;      // Смещение слева от края холста (px)
  y: number;      // Смещение сверху от края холста (px)
  width: number;  // Ширина виджета (px)
  height: number; // Высота виджета (px)
}

/** Бизнес-настройки конкретного виджета */
export interface WidgetConfig {
  id: string;
  title: string;
  chartType: ChartType;
  datasetId: string;
  xColumnId: string;     // Колонка для оси X (время/категории)
  yColumnIds: string[];  // Колонки для оси Y (меры/показатели)
  color: WidgetColor;
  textContent?: string;  // Текст (если тип 'text' или 'heading')
}

/** Полная сущность виджета */
export interface DashboardWidget {
  config: WidgetConfig;
  layout: WidgetLayout;
}

/** Сущность дашборда */
export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Реализация Холста и Сетки (Canvas & Grid CSS)

Холст позиционирует свои элементы абсолютно. Чтобы пользователю было проще ориентироваться, рекомендуется отрисовывать фоновую сетку (grid) с помощью радиального градиента в CSS.

```tsx
<main
  className="flex-1 overflow-auto bg-slate-50 relative min-h-[800px] min-w-[1200px]"
  style={{
    backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
    backgroundSize: '24px 24px', // Шаг виртуальной сетки
  }}
>
  {/* Абсолютно позиционируемые виджеты */}
  <div className="relative w-full h-full">
    {widgets.map(w => (
      <WidgetCard key={w.config.id} widget={w} />
    ))}
  </div>
</main>
```

---

## 3. Drag-and-Drop Перемещение (Чистый JS)

Для создания производительного перетаскивания без рывков и внешних библиотек используется классическая схема с расчетом смещения при нажатии и отслеживанием событий на уровне `window`.

### Алгоритм:
1. При `onMouseDown` на заголовке (ручке) виджета фиксируем начальные координаты курсора и текущие координаты виджета.
2. Вешаем слушатели `mousemove` и `mouseup` на глобальный объект `window`.
3. В обработчике движения вычисляем новую позицию как: `layout.x + (currentClientX - startClientX)`.
4. Ограничиваем координаты границами холста (например, `Math.max(0, newX)`).
5. При отпускании кнопки мыши удаляем глобальные слушатели.

```tsx
const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
  e.preventDefault(); // Предотвращаем выделение текста
  
  const startX = e.clientX - layout.x;
  const startY = e.clientY - layout.y;

  const onMouseMove = (moveEvent: MouseEvent) => {
    onLayoutChange(config.id, {
      x: Math.max(0, moveEvent.clientX - startX),
      y: Math.max(0, moveEvent.clientY - startY),
    });
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};
```

---

## 4. Нативное Изменение Размера (CSS Resize)

Вместо сложного рендеринга восьми угловых ручек изменения размера, можно использовать нативное свойство браузера `resize: both` в связке с событием `onMouseUp` для фиксации размеров в стейте.

### Реализация:
* Задаем виджету стили `resize: 'both'`, `overflow: 'hidden'`, а также `minWidth`/`minHeight`.
* При возникновении `onMouseUp` на виджете проверяем, изменились ли `offsetWidth` и `offsetHeight` по сравнению с сохраненным `layout`. Если да — вызываем callback сохранения позиции.

```tsx
export default function WidgetCard({ widget, onLayoutChange }: WidgetCardProps) {
  const { config, layout } = widget;

  return (
    <div
      className="absolute bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col group"
      style={{
        left: layout.x,
        top: layout.y,
        width: layout.width,
        height: layout.height,
        minWidth: 240,
        minHeight: 180,
        resize: 'both',       // Нативный ресайз браузера
        overflow: 'hidden',   // Обязательно для работы resize
      }}
      onMouseUp={(e) => {
        const el = e.currentTarget;
        const newWidth = el.offsetWidth;
        const newHeight = el.offsetHeight;
        if (newWidth !== layout.width || newHeight !== layout.height) {
          onLayoutChange(config.id, { width: newWidth, height: newHeight });
        }
      }}
    >
      {/* Шапка с зоной перетаскивания */}
      <div 
        className="flex items-center px-3 py-2 border-b border-slate-100 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleDragStart}
      >
        <span className="text-xs font-bold text-slate-700">{config.title}</span>
      </div>

      {/* Контентная область */}
      <div className="flex-1 overflow-hidden p-4">
        {/* График или текст */}
      </div>
    </div>
  );
}
```

---

## 5. Выравнивание по Сетке (Grid Snapping) — Опционально

Для создания более аккуратного интерфейса (чтобы виджеты вставали ровно по виртуальной сетке) новые координаты можно округлять до ближайшего шага сетки (например, 24px) в момент отпускания мыши (`onMouseUp` / завершение драга):

```typescript
const GRID_STEP = 24;

const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_STEP) * GRID_STEP;
};

// Применение при сохранении координат:
onLayoutChange(id, {
  x: snapToGrid(currentX),
  y: snapToGrid(currentY),
  width: snapToGrid(currentWidth),
  height: snapToGrid(currentHeight)
});
```

---

## 6. Вкладки и Размеры Листа (Canvas Tabs & Sizing)

Дашборд должен поддерживать управление структурой страниц (вкладок) и физическими размерами рабочей области (листа).

### Расширенная структура данных дашборда:
```typescript
export interface DashboardTab {
  id: string;
  name: string;
  widgets: DashboardWidget[];
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  canvasWidth: number;   // Физическая ширина листа (например, 1200) в px
  canvasHeight: number;  // Физическая высота листа (например, 800) в px
  tabs: DashboardTab[];  // Вкладки внутри дашборда
  createdAt: string;
  updatedAt: string;
}
```

### Применение в верстке холста:
Размеры листа жестко задаются через инлайновые стили `width` и `height` для контейнера холста. Сверху рендерится панель переключения табов:

```tsx
export default function DashboardCanvas({ dashboard, activeTabId, onTabChange }: CanvasProps) {
  const activeTab = dashboard.tabs.find(t => t.id === activeTabId) || dashboard.tabs[0];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Переключатель вкладок (Табы) */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-6 py-2.5">
        {dashboard.tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab.id === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Ограниченный лист холста с фоновой сеткой */}
      <div className="flex-1 overflow-auto p-8 bg-slate-100 flex items-start justify-center">
        <div
          className="bg-white border border-slate-200 rounded-3xl shadow-lg relative"
          style={{
            width: dashboard.canvasWidth,
            height: dashboard.canvasHeight,
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {activeTab.widgets.map(w => (
            <WidgetCard key={w.config.id} widget={w} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Правая панель настроек (Config Panel)

Панель настроек (Sidebar) располагается справа от холста и работает в двух режимах:

### Режим 1: По умолчанию (Инструменты добавления и Настройки листа)
Показывается, когда на холсте не выделен ни один виджет.
* **Добавление элементов**: блок с доступными типами элементов для добавления (Линейный график, Столбчатая диаграмма, Круговая диаграмма, Комбинированный график, Таблица данных, Большой заголовок, Обычный текст). При клике или перетаскивании элемент создается в центре видимой области холста.
* **Настройки листа**:
  * Поля ввода ширины (`canvasWidth`) и высоты (`canvasHeight`) листа в пикселях.
  * Панель управления вкладками (добавление новых вкладок, удаление или изменение названия текущих табов).

### Режим 2: Выделен виджет (Настройки элемента)
Показывается при клике на конкретную карточку виджета на холсте.
* **Выбор датасета (Dataset Mapping)**: селект для привязки к источнику данных.
* **Настройки осей и показателей**: выбор колонки для оси X (время/категории) и множественный выбор колонок для оси Y (показатели).
* **Визуальные настройки**:
  * Выбор цветовой палитры или основного цвета виджета.
  * Настройки типографики: выравнивание текста, размер шрифта, начертание.
  * Текстовое содержимое (для текстовых блоков и заголовков).

---

## 8. Сохранение, Удаление и Безопасность

Для работы с жизненным циклом дашборда на панели инструментов выводятся две кнопки действия:
1. **Сохранить**: инициирует отправку всей структуры объекта `Dashboard` (включая все табы, размеры холста и настройки виджетов) на сервер.
2. **Удалить**: запускает процесс удаления дашборда. 
   * **Критическое требование**: удаление **не должно** происходить мгновенно при клике. Должно открываться диалоговое окно (Confirm Modal) с текстом: *«Вы уверены, что хотите удалить дашборд [Имя]? Это действие необратимо.»* с кнопками подтверждения и отмены.

---

## 9. Интерактивные Графики и Визуализация

Визуализация данных внутри виджетов должна соответствовать премиальным UX-стандартам:
* **Использование существующих компонентов**: виджеты-графики должны рендерить общие библиотеки графиков проекта, унаследовав адаптивность и стили.
* **Красивые Hover-эффекты**: при наведении на точки или столбцы должен отображаться плавный, кастомизированный тултип с данными и подсветкой текущего элемента.
* **Комбинированные графики**: поддержка смешанных графиков (например, Line + Bar на одном холсте). 
  * При наведении на комбинированный график тултип (hover) должен отображать сгруппированные данные по всем осям и типам показателей одновременно (например, выводить и сумму MRR в виде столбца, и процент роста в виде линии).

