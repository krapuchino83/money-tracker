# Task ID: 4

**Title:** Типы Transaction и общие zod-схемы

**Status:** pending

**Dependencies:** 3

**Priority:** high

**Description:** Типобезопасность и валидация без `any`.

**Details:**

В `src/lib/types.ts` описать тип/интерфейс Transaction, согласованный с БД (amount как number в TS, хранение numeric в БД). Вынести zod-схему для create/update (тип, сумма ≥1, категория из фиксированного enum списка, описание ≤280 optional, дата). Экспортировать inferred types из zod для переиспользования в Server Actions и формах.

**Test Strategy:**

TypeScript strict: нет `any`; схема отклоняет невалидные payload на unit-уровне или ручной прогон.

## Subtasks

### 4.1. Интерфейс Transaction и маппинг из Supabase row

**Status:** pending  
**Dependencies:** None  

Учесть Decimal/string edge cases при чтении.

### 4.2. zod: transactionFormSchema с ограничениями PRD

**Status:** pending  
**Dependencies:** 4.1  

Категории: Зарплата, Фриланс, Еда, Транспорт, Развлечения, Прочее.
