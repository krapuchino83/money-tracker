# Task ID: 8

**Title:** Форма создания и Server Action addTransaction

**Status:** done

**Dependencies:** 4 ✓, 5 ✓, 6 ✓

**Priority:** high

**Description:** CREATE с zod и revalidatePath('/')

**Details:**

`transaction-form.tsx`: radio Доход/Расход, amount number min 1, select категорий из PRD, description max 280 optional, date default сегодня. Кнопка «+ Добавить» открывает `<dialog>` или отдельный маршрут — на выбор, зафиксировать в коде. В `app/actions.ts` реализовать `addTransaction` с parse zod на сервере, insert в Supabase, `revalidatePath('/')`. Форма: `action={addTransaction}` или вызов action из client component по гайду Next.js.

**Test Strategy:**

После сохранения новая строка видна в таблице без ручного refresh; невалидные данные не создают запись.

## Subtasks

### 8.1. Разметка формы и связь с полями zod

**Status:** pending  
**Dependencies:** None  

Ошибки валидации показать пользователю.

### 8.2. Server Action insert + revalidatePath

**Status:** pending  
**Dependencies:** 8.1  

Использовать server Supabase client.
