# Task ID: 11

**Title:** Бонус: фильтры «Все / Доходы / Расходы» через searchParams

**Status:** done

**Dependencies:** 6 ✓

**Priority:** low

**Description:** Опциональная фильтрация на главной.

**Details:**

Кнопки над таблицей переключают `?type=income|expense` или без параметра для «Все». Server Component читает `searchParams` и фильтрует запрос к Supabase. Сохранить совместимость с BalanceSummary (уточнить в реализации: только таблица или и карточки — задокументировать выбор).

**Test Strategy:**

Смена query меняет состав строк; прямой URL работает.

## Subtasks

### 11.1. Link или router replace для query

**Status:** pending  
**Dependencies:** None  

Без полной перезагрузки SPA где возможно.
