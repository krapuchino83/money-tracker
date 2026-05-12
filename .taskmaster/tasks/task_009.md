# Task ID: 9

**Title:** Удаление: deleteTransaction и confirm в строке

**Status:** pending

**Dependencies:** 8

**Priority:** medium

**Description:** DELETE через Server Action и иконка корзины.

**Details:**

В каждой строке `TransactionList` — кнопка-иконка корзины. Перед вызовом `deleteTransaction(id)` показать `window.confirm` или UI confirm по PRD. После успеха `revalidatePath('/')`. Обработать ошибки Supabase.

**Test Strategy:**

Удалить строку — исчезла из UI и из БД.

## Subtasks

### 9.1. Server Action deleteTransaction(id)

**Status:** pending  
**Dependencies:** None  

Проверка zod для id.

### 9.2. Интеграция confirm в таблице

**Status:** pending  
**Dependencies:** 9.1  

Текст «Точно удалить?»
