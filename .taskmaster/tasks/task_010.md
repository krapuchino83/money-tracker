# Task ID: 10

**Title:** Редактирование: клик по строке и updateTransaction

**Status:** pending

**Dependencies:** 8

**Priority:** medium

**Description:** UPDATE с той же формой, предзаполненной.

**Details:**

По клику на строку открыть форму с данными транзакции (dialog или страница). Режим edit: вызывать `updateTransaction(id, data)` в `actions.ts`, zod на сервере, `revalidatePath('/')`. Не дублировать схему валидации — общая с create где возможно.

**Test Strategy:**

Изменить сумму/категорию — отражается в таблице и в БД.

## Subtasks

### 10.1. Состояние выбранной транзакции для формы

**Status:** pending  
**Dependencies:** None  

Передача id и default values.

### 10.2. Server Action updateTransaction

**Status:** pending  
**Dependencies:** 10.1  

update по id с RLS.
