# Task ID: 6

**Title:** Главная: чтение транзакций, TransactionList, пустое состояние

**Status:** done

**Dependencies:** 3 ✓, 4 ✓, 5 ✓

**Priority:** high

**Description:** Server Component загружает данные из Supabase и показывает таблицу.

**Details:**

В `src/app/page.tsx` (или вынести в компонент) использовать server client для `select` из `transactions`. Компонент `transaction-list.tsx`: колонки дата, тип, категория, описание, сумма; цвет текста: доход зелёный, расход красный. Пустое состояние: текст + CTA «Добавить первую» (кнопка может вести к форме позже).

**Test Strategy:**

С seed данными таблица заполнена; после удаления всех строк в БД — пустое состояние.

## Subtasks

### 6.1. Запрос списка в Server Component

**Status:** done  
**Dependencies:** None  

Сортировка по date desc или created_at.

### 6.2. Таблица и цветовая индикация типа

**Status:** done  
**Dependencies:** 6.1  

Tailwind классы для income/expense.

### 6.3. Empty state + CTA

**Status:** done  
**Dependencies:** 6.1  

Условный рендер при length===0.
