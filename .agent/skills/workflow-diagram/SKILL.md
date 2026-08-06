---
name: workflow-diagram
description: Руководство по созданию интерактивного редактора графов связей (Workflow Diagram) с поддержкой добавления/перетаскивания узлов, отрисовкой динамических SVG-связей (кривых Безье) и поддержкой зума/панорамирования холста.
---

# Интерактивные графы связи элементов

Этот навык определяет технические стандарты, алгоритмы и примеры реализации визуальных редакторов графов (схем связей) с использованием SVG для соединительных линий и абсолютного позиционирования для узлов в приложениях на React.

## 1. Структура Данных Графа (TypeScript)

Граф состоит из набора вершин (узлов) и ребер (связей между ними).

```typescript
export interface Position {
  x: number;
  y: number;
}

export type NodeCategory = 'input' | 'metric' | 'output' | 'constant';

export interface MetricNode {
  id: string;
  label: string;
  category: NodeCategory;
  position: Position;
  value?: number;
}

export interface MetricEdge {
  id: string;
  sourceId: string; // ID узла-источника
  targetId: string; // ID целевого узла
  coefficient?: number; // Вес связи
}

export interface MetricModel {
  id: string;
  title: string;
  nodes: MetricNode[];
  edges: MetricEdge[];
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}
```

---

## 2. Архитектура холста (Canvas & SVG Layers)

Для качественного рендеринга и высокой производительности холст разделяется на два основных слоя:
1. **SVG-слой (нижний)**: используется для отрисовки линий и стрелок (ребер). Обладает стилями `pointer-events: none` для того, чтобы клики проходили сквозь него на холст, но сами линии могут иметь `pointer-events: auto` для возможности выделения связи.
2. **HTML-слой узлов (верхний)**: узлы позиционируются абсолютно поверх SVG-слоя через CSS `transform: translate(x, y)`.

Оба слоя находятся внутри одного контейнера трансформации:
```tsx
<div 
  style={{
    position: 'absolute',
    transformOrigin: '0 0',
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
  }}
>
  <svg style={{ position: 'absolute', overflow: 'visible' }}>
    {/* Отрисовка ребер графа */}
  </svg>
  
  {/* Рендеринг узлов */}
  {nodes.map(node => <NodeComponent key={node.id} node={node} />)}
</div>
```

---

## 3. Математика Кривых Безье для Ребер (Bezier Curves)

Для плавного соединения портов узлов используются кубические кривые Безье. Они выглядят профессионально и не ломаются при сильных изгибах.

Формула пути в SVG:
`d="M x1 y1 C (x1 + cp) y1, (x2 - cp) y2, x2 y2"`
Где `cp` — управляющее расстояние (control point offset), обычно рассчитываемое как `Math.max(60, Math.abs(x2 - x1) * 0.4)`. Это позволяет сглаживать изгиб линии в зависимости от расстояния между узлами по горизонтали.

```tsx
interface EdgeLineProps {
  x1: number; y1: number; // Точка выхода порта источника
  x2: number; y2: number; // Точка входа порта цели
  isSelected: boolean;
}

export default function EdgeLine({ x1, y1, x2, y2, isSelected }: EdgeLineProps) {
  const cp = Math.max(60, Math.abs(x2 - x1) * 0.4);
  const pathData = `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;

  return (
    <g>
      {/* Широкая невидимая линия под основной для облегчения клика */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
      />
      {/* Отображаемая линия связи */}
      <path
        d={pathData}
        fill="none"
        stroke={isSelected ? '#6366f1' : '#94a3b8'}
        strokeWidth={isSelected ? 3 : 2}
        className="transition-all duration-150"
      />
    </g>
  );
}
```

---

## 4. Динамическая отрисовка связей при перемещении объектов

Координаты связей (стрелочек) вычисляются динамически на основе текущих координат позиций `MetricNode.position` в состоянии React. Это обеспечивает автоматическую подстройку («прилипание») стрелочек к узлам во время их перетаскивания.

### Логика вычисления координат связи:
```typescript
const NODE_WIDTH = 180;
const NODE_HEIGHT = 70;

// Рендеринг связей в SVG-слое
{edges.map(edge => {
  const sourceNode = nodes.find(n => n.id === edge.sourceId);
  const targetNode = nodes.find(n => n.id === edge.targetId);

  if (!sourceNode || !targetNode) return null;

  // Точка выхода: правый край узла-источника по центру высоты
  const x1 = sourceNode.position.x + NODE_WIDTH;
  const y1 = sourceNode.position.y + NODE_HEIGHT / 2;

  // Точка входа: левый край целевого узла по центру высоты
  const x2 = targetNode.position.x;
  const y2 = targetNode.position.y + NODE_HEIGHT / 2;

  return (
    <EdgeLine
      key={edge.id}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      isSelected={selectedEdgeId === edge.id}
    />
  );
})}
```

### Перетаскивание узла с учетом масштаба (Zoom Compensation):
При изменении позиции узла мышкой необходимо делить дельту движения курсора (`clientX`, `clientY`) на текущий масштаб холста `transform.scale`. Если этого не сделать, скорость движения узла под курсором будет не совпадать с реальным движением мыши (узел будет двигаться слишком медленно при сильном отдалении или слишком быстро при сильном приближении).

```typescript
const handleNodeDrag = (e: React.MouseEvent, nodeId: string) => {
  e.preventDefault();
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;

  const startMouseX = e.clientX;
  const startMouseY = e.clientY;
  const startNodeX = node.position.x;
  const startNodeY = node.position.y;

  const onMouseMove = (moveEvent: MouseEvent) => {
    // Делим дельту координат мыши на масштаб scale!
    const dx = (moveEvent.clientX - startMouseX) / transform.scale;
    const dy = (moveEvent.clientY - startMouseY) / transform.scale;

    updateNodePosition(nodeId, {
      x: startNodeX + dx,
      y: startNodeY + dy
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

## 5. Создание связей перетаскиванием (Drag-to-Connect)

Связи должны создаваться интерактивно путем перетаскивания линии от правого порта (выход) одного узла к левому порту (вход) другого узла.

### Логика реализации:
1. При `onMouseDown` на порту источника фиксируем его координаты в пространстве холста (`x1, y1`) и сохраняем `sourceId` во временное состояние линии связи (`draftEdge`).
2. При `onMouseMove` пересчитываем текущие координаты мыши в координаты холста с помощью `screenToCanvas` (учитывая `transform.x`, `transform.y`, `transform.scale`) и рисуем временную пунктирную линию Безье от порта `sourceId` к курсору.
3. При `onMouseUp` на входящем порту целевого узла:
   - Проверяем, что `sourceId !== targetId` (запрет связи узла с самим собой).
   - Проверяем, что связь между этими узлами в данном направлении еще не существует.
   - Создаем новое ребро `MetricEdge` и добавляем его в стейт.
4. В любом случае при `mouseup` на уровне `window` сбрасываем `draftEdge`.

---

## 6. Добавление и удаление объектов на холсте

Редактор графа должен предоставлять возможность динамического изменения количества узлов и связей.

### Добавление объектов в точку клика холста
При добавлении нового узла (например, через кнопку «Добавить узел» или клик правой кнопкой мыши) его координаты на холсте должны вычисляться на основе экранных координат мыши в момент клика, приведенных к масштабу и сдвигу холста:

```typescript
const handleAddNode = (e: React.MouseEvent) => {
  const containerRect = containerRef.current?.getBoundingClientRect();
  if (!containerRect) return;

  // Преобразуем координаты клика на экране в координаты внутри холста
  const canvasPos = screenToCanvas(e.clientX, e.clientY, transform, containerRect);

  const newNode: MetricNode = {
    id: `node-${Date.now()}`,
    label: 'Новый показатель',
    category: 'metric',
    position: {
      x: canvasPos.x - NODE_WIDTH / 2, // Центрируем узел по курсору
      y: canvasPos.y - NODE_HEIGHT / 2
    }
  };

  setNodes(prev => [...prev, newNode]);
};
```

### Каскадное удаление узлов
При удалении узла с холста необходимо гарантировать целостность данных графа. Удаление узла должно автоматически приводить к каскадному удалению всех входящих и исходящих из него связей (ребер), иначе в графе останутся ссылки на несуществующие идентификаторы:

```typescript
const handleDeleteNode = (nodeId: string) => {
  // 1. Удаляем сам узел
  setNodes(prev => prev.filter(n => n.id !== nodeId));
  // 2. Каскадно удаляем все связанные с ним ребра
  setEdges(prev => prev.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId));
  
  // Сбрасываем фокус выделения
  if (selectedNodeId === nodeId) {
    setSelectedNodeId(null);
  }
};
```

### Удаление связей
Пользователь должен иметь возможность выделить конкретное ребро (клик по линии) и удалить только его, не затрагивая сами узлы:

```typescript
const handleDeleteEdge = (edgeId: string) => {
  setEdges(prev => prev.filter(e => e.id !== edgeId));
  if (selectedEdgeId === edgeId) {
    setSelectedEdgeId(null);
  }
};
```

---

## 7. Перемещение по листу (Pan) и Масштабирование (Zoom)

Для удобной навигации по большим графам холст должен поддерживать свободное перемещение (панорамирование) и масштабирование.

### Перемещение (Pan) правой кнопкой мыши
Пользователь может перемещаться по листу (двигать холст в любом направлении для просмотра), нажав и удерживая **правую кнопку мыши (ПКМ)**:
* Нажатие ПКМ (`e.button === 2`) на пустом месте холста или узле запускает режим панорамирования.
* Во время перемещения курсора мыши координаты холста `transform.x` и `transform.y` сдвигаются на дельту движения мыши.
* Для корректной работы обязательно блокируется стандартное контекстное меню браузера с помощью `e.preventDefault()` на событии `onContextMenu`.

```typescript
// Блокировка контекстного меню на холсте
const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
};

// Начало перемещения при клике ПКМ
const handleMouseDown = (e: React.MouseEvent) => {
  if (e.button !== 2) return; // Проверяем, что нажата именно ПКМ
  e.preventDefault();
  
  const startX = e.clientX;
  const startY = e.clientY;
  const initialTx = transform.x;
  const initialTy = transform.y;

  const onMouseMove = (moveEvent: MouseEvent) => {
    setTransform(prev => ({
      ...prev,
      x: initialTx + (moveEvent.clientX - startX),
      y: initialTy + (moveEvent.clientY - startY)
    }));
  };

  const onMouseUp = (upEvent: MouseEvent) => {
    if (upEvent.button !== 2) return;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};
```

### Преобразование экранных координат в координаты холста:
При зуме и сдвиге холста экранные координаты мыши больше не совпадают с координатами сетки графа. Для перевода используется функция:
```typescript
const screenToCanvas = (screenX: number, screenY: number, transform: CanvasTransform, containerRect: DOMRect): Position => {
  return {
    x: (screenX - containerRect.left - transform.x) / transform.scale,
    y: (screenY - containerRect.top - transform.y) / transform.scale,
  };
};
```

### Масштабирование (Zoom) относительно курсора мыши:
Масштабирование колесиком мыши должно происходить плавно и центрироваться относительно точки, в которой сейчас находится курсор:
```typescript
const onWheel = (e: React.WheelEvent, containerRect: DOMRect) => {
  e.preventDefault();
  const mouseX = e.clientX - containerRect.left;
  const mouseY = e.clientY - containerRect.top;
  const ZOOM_STEP = 0.12;

  setTransform(prev => {
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    const newScale = Math.min(3.0, Math.max(0.15, prev.scale + delta));
    const scaleRatio = newScale / prev.scale;
    
    return {
      x: mouseX - scaleRatio * (mouseX - prev.x),
      y: mouseY - scaleRatio * (mouseY - prev.y),
      scale: newScale,
    };
  });
};
```

### Автоматическое вписывание контента (Fit Content):
Для центрирования всех узлов в видимой области:
1. Находим минимальные и максимальные координаты `x` и `y` среди всех узлов графа.
2. Вычисляем физический размер контента: `contentWidth = maxX - minX`, `contentHeight = maxY - minY`.
3. Рассчитываем необходимый масштаб: `scale = Math.min(containerWidth / contentWidth, containerHeight / contentHeight)`.
4. Сдвигаем холст: `x = (containerWidth - contentWidth * scale) / 2 - minX * scale`, аналогично для `y`.
5. Применяем новые параметры трансформации.

---

## 8. Правая панель настроек (Config Panel)

Справа от холста должна располагаться панель управления и настроек (Sidebar), интерфейс которой динамически переключается в зависимости от выделенного на листе объекта.

Панель имеет три режима отображения:

### Режим 1: Ничего не выделено (Общие настройки и Добавление)
Показывается по умолчанию, когда пользователь кликнул по пустому месту холста.
* **Содержимое**:
  * Общая информация о текущей модели графа (название, описание, дата изменения).
  * Инструменты быстрого добавления новых элементов на лист (кнопки для создания узлов различных категорий, например: «Добавить показатель», «Добавить константу»).
  * Кнопки управления холстом (очистить лист, центрировать вид `fitContent`).

### Режим 2: Выделен элемент/узел (Настройки элемента)
Показывается при клике левой кнопкой мыши по конкретному узлу графа.
* **Содержимое**:
  * Форма редактирования основных метаданных узла (текстовое название/лейбл, изменение категории узла).
  * Редактор математического значения или формулы: если категория узла подразумевает расчетный показатель, выводится поле для ввода логики/коэффициентов или связывания с другими узлами.
  * Кнопка удаления этого узла с холста (срабатывает каскадно с удалением связей).
  * Все изменения в панели должны мгновенно обновлять стейт `nodes` и отражаться на холсте.

### Режим 3: Выделена стрелочка/связь (Настройки связи)
Показывается при клике левой кнопкой мыши по SVG-линии связи.
* **Содержимое**:
  * Информация о направлении связи: имя узла-источника (Source) и имя узла-цели (Target).
  * Поле настройки веса или коэффициента влияния связи (например, числовой коэффициент влияния одного показателя на другой).
  * Возможность выбора математического типа связи (сложение, умножение, процентное влияние).
  * Кнопка «Удалить связь», удаляющая только ребро из массива `edges`.
