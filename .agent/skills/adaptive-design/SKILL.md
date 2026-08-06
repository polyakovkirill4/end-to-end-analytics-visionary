---
name: adaptive-design
description: Guidelines and standards for implementing responsive and adaptive layouts across mobile devices (320px+), tablets (768px+), laptops (1366px/1440px), and desktops (1920px+). Includes compaction rules for 1366px screens, horizontal scroll prevention, modal window sizing, and touch target rules. Use this skill when designing or modifying UI components, layouts, or pages.
---

# Адаптивный дизайн и адаптивная верстка (Responsive & Adaptive Layouts)

Этот навык описывает строгие стандарты и правила реализации адаптивной верстки в веб-приложениях на базе React и Next.js. ИИ-агент обязан следовать этим правилам при создании или изменении любых UI-компонентов, страниц и макетов в любом проекте.

---

## 1. Брейкпоинты и целевые устройства

Мы ориентируемся на следующие ключевые разрешения экранов (стандартная сетка Tailwind CSS):

| Устройство | Разрешение | Tailwind Префикс | Описание |
| :--- | :--- | :--- | :--- |
| **Мобильные (Small)** | 320px — 480px | По умолчанию (mobile first) | Смартфоны в портретной ориентации |
| **Планшеты (Medium)** | 481px — 1023px | `md:` (от 768px) | Планшеты (iPad и аналоги) |
| **Ноутбуки 1366 (Large)** | 1024px — 1439px | `lg:` (от 1024px) / `xl:` (от 1280px) | Ноутбуки 1366x768 и малые экраны |
| **Десктопы 1920 (X-Large)**| 1440px — 1920px+ | `2xl:` (от 1536px) | Мониторы FullHD и выше |

---

## 2. Стандарты для ноутбуков (1366px) — Проблема «крупного интерфейса»

Экраны с шириной **1366px** часто страдают от чрезмерно крупных элементов, если верстка разрабатывалась исключительно под большие FullHD-мониторы (1920px).

### Решение: Уплотнение интерфейса (Compaction)
При ширине экрана от 1024px до 1366px (попадающих под брейкпоинты `lg:` и `xl:`) интерфейс должен автоматически становиться более компактным:

1. **Боковые панели и Сайдбары (Sidebar)**:
   * На экранах `< 1280px` боковое меню должно переходить в компактный свернутый вид (например, `w-20` с иконками вместо `w-64` с текстом) либо полностью скрываться под кнопку бургер-меню.
   * Высвобождаемая область отдается под основной контент (таблицы, списки, панели управления).
2. **Размеры шрифтов**:
   * Для заголовков на экранах 1366px (`xl:`) используйте уменьшенный размер: вместо `2xl:text-3xl` (30px) пишите `xl:text-2xl` (24px) или `text-xl` (20px).
   * Базовый текст: `text-sm` (14px) вместо `text-base` (16px) на ноутбуках.
3. **Отступы и сетка (Paddings, Gaps)**:
   * Контейнеры и карточки: уменьшайте внутренние и внешние отступы. Вместо `p-6` или `p-8` на экранах ноутбуков используйте `xl:p-4 lg:p-4`.
   * Шаг сетки (Grid gap): используйте `gap-4` вместо `gap-6` или `gap-8`.

*Пример адаптивного контейнера:*
```tsx
<div className="p-4 md:p-6 xl:p-4 2xl:p-6 gap-4 xl:gap-4 2xl:gap-6">
  {/* Контент */}
</div>
```

---

## 3. Стандарты для мобильных устройств (320px — 480px)

Мобильная версия должна быть аккуратной, сфокусированной на ключевом контенте и свободной от визуального шусора.

### А. Предотвращение горизонтального скролла (Horizontal Scroll)
* **СТРОГО ЗАПРЕЩЕНО** допускать горизонтальную прокрутку всей страницы веб-приложения. Родительский контейнер/макет должен иметь класс `overflow-x-hidden`.
* Если элемент не помещается по ширине, он должен переноситься (`flex-wrap`, `grid-cols-1`) либо динамически сжиматься.
* **Исключение — Таблицы**: табличные данные разрешено скроллить по горизонтали. Для этого оборачивайте саму таблицу в контейнер с `overflow-x-auto` и добавляйте плавное исчезновение по краям или индикатор скролла.

### Б. Модальные окна на мобильных
* Модальные окна **обязаны** полностью помещаться в экран по высоте.
* Используйте связку максимальной высоты и вертикального скролла для содержимого:
  ```tsx
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Шапка модального окна */}
      <div className="p-4 border-b">...</div>
      {/* Скроллируемый контент */}
      <div className="p-4 overflow-y-auto flex-1">...</div>
      {/* Футер с кнопками */}
      <div className="p-4 border-t">...</div>
    </div>
  </div>
  ```
* **Альтернатива (Рекомендуется)**: Для мобильных версий вместо стандартного центрированного модального окна используйте нижнюю шторку (**Bottom Sheet / Drawer**), которая выезжает снизу экрана на весь экран по ширине и имеет привычный мобильный жест закрытия (swipe down).

### В. Микро-отступы и шрифты
* Отступы на экранах телефонов должны быть минимальными: `p-3` или `p-4` (12-16px).
* Базовый шрифт текста: `text-xs` (12px) или `text-sm` (14px). Заголовки страниц: не более `text-lg` (18px) или `text-xl` (20px).
* Сложные сетки (Bento Grid, Multi-column Grid) на мобильных экранах ВСЕГДА перестраиваются в одну колонку (`grid-cols-1`).

### Г. Сенсорные зоны (Touch Targets)
* Любой кликабельный элемент (кнопка, иконка, ссылка, чекбокс) должен иметь активную область нажатия **не менее 44x44px** для предотвращения ложных или ошибочных нажатий пальцем.
* Используйте отступы (padding) или невидимые псевдоэлементы для увеличения зоны клика мелких иконок.

---

## 4. Практические примеры кода

### А. Универсальная адаптивная таблица с горизонтальным скроллом
```tsx
interface TableDataRow {
  id: string;
  name: string;
  category: string;
  value: number;
}

export function ResponsiveTable({ data }: { data: TableDataRow[] }) {
  // Универсальное форматирование чисел/валюты без внешних привязок
  const formatValue = (num: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Контейнер, изолирующий горизонтальный скролл */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <th className="p-4 font-semibold">Название</th>
              <th className="p-4 font-semibold">Категория</th>
              <th className="p-4 font-semibold text-right">Значение</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-medium text-slate-900">{row.name}</td>
                <td className="p-4 text-slate-500">{row.category}</td>
                <td className="p-4 text-right font-bold text-slate-900">
                  {formatValue(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Б. Адаптивная сетка Bento Grid (Уплотнение на 1366px и перестроение на мобильных)
```tsx
export function BentoGridExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-4 2xl:gap-6">
      {/* Карточка 1 - Занимает 1 колонку на мобильных и планшетах, на больших экранах адаптируется */}
      <div className="p-4 md:p-6 xl:p-4 2xl:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm xl:text-xs 2xl:text-sm font-semibold text-slate-500">
          Основная метрика
        </h3>
        <p className="text-2xl xl:text-xl 2xl:text-2xl font-bold mt-1">1 250 000</p>
      </div>

      {/* Карточка 2 */}
      <div className="p-4 md:p-6 xl:p-4 2xl:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm xl:text-xs 2xl:text-sm font-semibold text-slate-500">
          Показатель конверсии
        </h3>
        <p className="text-2xl xl:text-xl 2xl:text-2xl font-bold mt-1">4.8%</p>
      </div>

      {/* Карточка 3 (Занимает 2 колонки на планшетах md: и возвращается в 1 колонку на lg:) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-1 p-4 md:p-6 xl:p-4 2xl:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm xl:text-xs 2xl:text-sm font-semibold text-slate-500">
          Активные элементы
        </h3>
        <p className="text-2xl xl:text-xl 2xl:text-2xl font-bold mt-1">1 420 ед.</p>
      </div>
    </div>
  );
}
```

---

## 5. Чек-лист проверки ИИ-агента (Self-Check List)

Перед тем как завершить работу над любой задачей по верстке или интерфейсу, ИИ-агент **обязан** пройтись по данному списку самопроверки:

- [ ] **Отсутствие горизонтального скролла страницы**: Проверить макет на разрешениях 320px, 375px и 425px. Есть ли элементы, выходящие за пределы экрана?
- [ ] **Поведение таблиц**: Все ли таблицы обернуты в `overflow-x-auto`? Задана ли для них минимальная ширина (`min-w-[...]`), чтобы данные не сжимались в нечитаемую кашу?
- [ ] **Компактность на 1366px**: Проверены ли отступы и размеры шрифтов при ширине 1024px — 1366px? Использованы ли модификаторы `xl:` и `lg:` для уменьшения padding и font-size?
- [ ] **Модальные окна**: Помещается ли модальное окно целиком в экран высотой 600px (стандартный мобильный телефон в ландшафтном режиме или с открытой клавиатурой)? Добавлен ли внутренний скролл `overflow-y-auto`?
- [ ] **Сенсорные зоны (Touch Targets)**: Все ли кнопки, ссылки и интерактивные иконки имеют размер не менее 44x44px на мобильных устройствах?
- [ ] **Инпуты и клавиатура**: Указаны ли для числовых полей атрибуты `inputMode="decimal"` или `inputMode="numeric"`, чтобы у пользователя открывалась удобная цифровая клавиатура?
