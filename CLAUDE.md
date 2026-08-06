Пиши код как senior-разработчик.
Дизайн делай как дизайнер senior-дизайнер.

Выполняй задачи профессионально и качественно!

Инструкции и планы (артефакты) пиши на русском языке.
Task что ты делаешь пиши на русском языке.
Сообщения в чате текст на русском языке.
По ходу выполнения задачи, пиши кратко что ты делаешь и для чего, чтобы я понимал что ты прямо сейчас будешь делать.
Консоль команды перед выполнением пиши что это за команда чтобы я знал.
Если нужна дополнительная информация тебе для написания кода, можешь спросить, если у тебя вся нужная информация, сразу приступай к написанию кода.


Чем меньше строк кода, тем лучше.
Не удаляй комментарии из кода.
Используй информацию об актуальных библиотек из MCP сервера Context7.
Tailwind: Использовать только стандартные утилиты. Избегать громоздких инлайновых стилей, если их можно вынести в компоненты.
Для работы скриптов делай обработку ошибок и выводит сообщение с текстом ошибки (отдельно компонент должен быть с оформлением сообщением).
Business Logic Код должен учитывать масштабируемость. Если функция может занять более 200мс, предложи асинхронное решение или оптимизацию.
Не останавливайся, пока не реализуешь эту функцию полностью и до конца.
Когда пишешь код, не ломай действующий функционал и не изменяй дизайн уже сделанных блоков.

No any: Использование any запрещено. Только строгие интерфейсы.
Адаптивный дизайн для мобильных устройств, для планшетов и малых размеров ноутбуков. С аккуратными отступами, размерами шрифтов под устройство.
Формат данных используй правильный, валидация полей, дефолтные значения, форматирование данных, ховеры, тултайпы, анимация.

Не запускай просмотр и тестирование в браузере, если я не скажу тебе!




# Base Project Rules for AI

This file provides core architectural guidelines and rules that apply to this repository.

## AI Rules & Skills (`.agent/`)
**Important**: Always follow conventions in `.agent/rules/router.md` and `.agent/rules/rules.md` before making architectural decisions.
- **Skills**: Check `.agent/skills/*/SKILL.md` for specific tasks (e.g., auth, billing, ui, adaptive-design) before implementing features.
- **Workflows**: Check `.agent/workflows/*.md` for step-by-step procedures (bug fixing, refactoring).

## Code Quality & Architecture
- **Strict Types**: Use strict TypeScript. The use of `any` is strictly forbidden. 
- **Imports**: No relative imports (`../`). Always use absolute path aliases (e.g., `@/`).
- **Components**: Component props must be explicitly typed as `[ComponentName]Props` and destructured in the function signature.
- **Formatting**: Never hand-roll date, time, or currency formatting. Always use the project's centralized utility functions (e.g., from `src/utils/formatters.ts`). Missing values should be rendered consistently (e.g., `—`), not as `null` or blank.

## Database & Backend (Supabase / Postgres)
- **Naming Conventions**: Use `snake_case` for all tables and columns.
- **Required Columns**: All tables should include `id uuid default gen_random_uuid()`, `created_at`, and `updated_at` (timestamptz).
- **Deletes**: Always use soft deletes (`deleted_at` or `is_active`) rather than hard deletes.
- **Security**: Row Level Security (RLS) must be enabled and properly configured for all tenant-specific tables.

## UI / UX & Mobile Design
- **Touch Targets**: Must be at least 44×44px for accessibility. 
- **Overlays**: Prefer bottom sheets over centered modals for filters and long lists on mobile screens.

