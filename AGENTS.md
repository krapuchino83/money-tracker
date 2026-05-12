# Money Tracker — заметки для агента

- Стек: Next.js 16 (App Router), TypeScript strict, Tailwind 4, shadcn base-nova, Supabase (`@supabase/ssr`), Server Actions в `src/app/actions.ts`.
- Переменные: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) в `.env.local`. Service role в браузер не передавать.
- Схема БД: `supabase/migrations/0001_transactions.sql` — таблица `transactions`, открытые RLS-политики для учебного модуля.
- UI: главная `src/app/page.tsx`; таблица и диалоги — `src/components/` (`transactions-board`, `transaction-form-dialog`, `transaction-list`, `balance-summary`).
- REST: `GET|POST|PATCH /api/transactions`, `DELETE /api/transactions?id=` — те же zod-схемы, что и для Server Actions.
- Задачи: `.taskmaster/tasks/tasks.json` (тег `master`); команды — `npx task-master list|next|show`.
