# Task ID: 12

**Title:** GET /api/transactions, проверка Thunder Client и деплой Vercel

**Status:** done

**Dependencies:** 6 ✓, 8 ✓, 9 ✓, 10 ✓

**Priority:** medium

**Description:** REST для сравнения с Server Actions + продакшен env.

**Details:**

Реализовать `src/app/api/transactions/route.ts` с методом GET, возвращающим JSON списка (чтение из Supabase server-side). Прогнать запросы в Thunder Client: коды 200, корректное тело. Подключить репозиторий к Vercel, задать env переменные Supabase, задеплоить `main`, проверить работу сайта на `*.vercel.app`.

**Test Strategy:**

Thunder Client GET локально и на проде; smoke-тест UI на Vercel.

## Subtasks

### 12.1. Route handler GET + json response

**Status:** pending  
**Dependencies:** None  

Обработка ошибок БД → 500 с телом.

### 12.2. Vercel env и production build

**Status:** pending  
**Dependencies:** 12.1  

Совпадение ключей с Supabase.
