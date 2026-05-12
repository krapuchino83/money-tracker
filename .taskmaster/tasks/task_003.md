# Task ID: 3

**Title:** Таблица transactions, RLS и тестовые данные

**Status:** done

**Dependencies:** 2 ✓

**Priority:** high

**Description:** Создать схему БД и политики RLS для учебного открытого доступа.

**Details:**

В Supabase создать таблицу `transactions` с полями из PRD: id int8 PK, amount numeric(10,2), type text (income|expense), category text, description text nullable, date date, created_at timestamptz default now(). Включить RLS: SELECT/INSERT/UPDATE/DELETE разрешены всем (как в PRD для модуля 6). Добавить минимум 5 тестовых строк через Table Editor или SQL.

**Test Strategy:**

SQL select в SQL Editor возвращает 5+ строк; политики не блокируют CRUD для anon.

## Subtasks

### 3.1. DDL таблицы и индексы при необходимости

**Status:** done  
**Dependencies:** None  

Соответствие типов PRD.

### 3.2. Политики RLS для учебного режима

**Status:** done  
**Dependencies:** 3.1  

Явные политики для всех операций.

### 3.3. Seed: 5+ транзакций разных типов и категорий

**Status:** done  
**Dependencies:** 3.2  

Покрыть income и expense.
