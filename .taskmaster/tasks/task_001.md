# Task ID: 1

**Title:** Скелет Next.js 16 + TypeScript + Tailwind CSS 4

**Status:** pending

**Dependencies:** None

**Priority:** high

**Description:** Создать приложение money-tracker с App Router и базовой структурой папок из PRD.

**Details:**

Инициализировать проект на Next.js 16 с TypeScript. Подключить Tailwind CSS 4. Создать каркас `src/app/` (`layout.tsx`, `page.tsx`, `globals.css`), заготовки `src/components/`, `src/lib/`. Убедиться, что `npm run dev` поднимается без ошибок. Не использовать deprecated `@supabase/auth-helpers-nextjs`.

**Test Strategy:**

Локально открыть `/`, убедиться что страница рендерится; `npm run build` проходит.

## Subtasks

### 1.1. create-next-app с App Router и TS

**Status:** pending  
**Dependencies:** None  

Сгенерировать проект, включить strict TypeScript.

### 1.2. Настроить Tailwind 4 и глобальные стили

**Status:** pending  
**Dependencies:** 1.1  

Подключить `globals.css`, базовые утилиты.

### 1.3. Создать пустые каталоги components/lib по PRD

**Status:** pending  
**Dependencies:** 1.1  

Структура как в разделе PRD про папки.
