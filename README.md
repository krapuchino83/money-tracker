# Money Tracker

Веб-учёт доходов и расходов (Next.js 16 + Supabase). Полное ТЗ: [`docs/PRD.md`](docs/PRD.md).

## Supabase — что сделать, чтобы заработало

1. **Создай проект** на [supabase.com](https://supabase.com) и открой **Settings → API**: понадобятся **Project URL** и **anon** (или publishable) ключ.

2. **Локальные переменные** — в корне репозитория создай файл `.env.local` (он в `.gitignore`, в git не попадает):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ВАШ_ПРОЕКТ.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_или_publishable_ключ
   ```

   Шаблон переменных также в [`.env.example`](.env.example).

3. **Таблица в базе** — в Supabase открой **SQL → New query**, вставь содержимое файла [`supabase/migrations/0001_transactions.sql`](supabase/migrations/0001_transactions.sql) и выполни. Появятся таблица `transactions`, RLS и тестовые строки.

4. **Запуск приложения**

   ```bash
   npm install
   npm run dev
   ```

   Открой [http://localhost:3000](http://localhost:3000): без шагов 1–3 на главной будет текст про настройку `.env.local` и миграцию.

## Где в коде лежит Supabase

| Что | Путь |
|-----|------|
| Клиенты SSR / браузер | `src/lib/supabase/` (`client.ts`, `server.ts`, `middleware.ts`, `env.ts`) |
| Обновление сессии | `src/middleware.ts` |
| Запросы с главной и API | `src/app/page.tsx`, `src/app/actions.ts`, `src/app/api/transactions/route.ts` |
| Миграция SQL | `supabase/migrations/0001_transactions.sql` |

Кратко для ИИ: [`AGENTS.md`](AGENTS.md).
