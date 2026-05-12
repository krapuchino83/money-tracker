# Task ID: 2

**Title:** Supabase: проект, переменные, @supabase/ssr, клиенты, middleware

**Status:** done

**Dependencies:** 1 ✓

**Priority:** high

**Description:** Подключить Supabase через современный пакет и подготовить browser/server клиенты.

**Details:**

Создать проект Supabase, вынести `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` в `.env.local`. Установить `@supabase/ssr`. Реализовать `src/lib/supabase/client.ts` (createBrowserClient) и `server.ts` (createServerClient). Добавить `src/middleware.ts` для обновления сессии по документации Supabase + Next.js App Router.

**Test Strategy:**

Импорт клиентов без ошибок; middleware не падает на каждом запросе.

## Subtasks

### 2.1. Env и ключи только для anon (не service role в браузер)

**Status:** pending  
**Dependencies:** None  

Проверить отсутствие service role в клиентском коде.

### 2.2. Реализовать server и browser Supabase клиенты

**Status:** pending  
**Dependencies:** None  

Файлы как в PRD.

### 2.3. Middleware для cookie-сессии

**Status:** pending  
**Dependencies:** 2.2  

По официальному гайду @supabase/ssr.
