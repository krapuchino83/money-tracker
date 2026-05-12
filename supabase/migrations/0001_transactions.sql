-- Money Tracker: transactions + open RLS (module 6, no auth)
-- Run in Supabase SQL Editor or via `supabase db push` if you use Supabase CLI.

create table if not exists public.transactions (
  id bigint generated always as identity primary key,
  amount numeric(10, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null,
  description text,
  date date not null,
  created_at timestamptz not null default now()
);

comment on table public.transactions is 'Income/expense rows; RLS open for teaching (module 6).';

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_all" on public.transactions;
drop policy if exists "transactions_insert_all" on public.transactions;
drop policy if exists "transactions_update_all" on public.transactions;
drop policy if exists "transactions_delete_all" on public.transactions;

create policy "transactions_select_all"
  on public.transactions for select
  using (true);

create policy "transactions_insert_all"
  on public.transactions for insert
  with check (true);

create policy "transactions_update_all"
  on public.transactions for update
  using (true)
  with check (true);

create policy "transactions_delete_all"
  on public.transactions for delete
  using (true);

-- Sample data (>=5 rows per PRD)
insert into public.transactions (amount, type, category, description, date) values
  (85000.00, 'income', 'Зарплата', 'Оклад за месяц', date_trunc('month', now())::date + 4),
  (12000.00, 'income', 'Фриланс', 'Проект А', date_trunc('month', now())::date + 6),
  (3200.50, 'expense', 'Еда', 'Продукты', date_trunc('month', now())::date + 1),
  (890.00, 'expense', 'Транспорт', 'Метро', date_trunc('month', now())::date + 2),
  (4500.00, 'expense', 'Развлечения', 'Кино', date_trunc('month', now())::date + 9),
  (150.00, 'expense', 'Прочее', 'Кофе', date_trunc('month', now())::date + 11);
