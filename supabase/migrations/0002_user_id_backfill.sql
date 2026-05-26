-- 0002 с сохранением данных: user_id + RLS (без DELETE FROM transactions).
-- Перед запуском замените email на ваш логин в Supabase Auth.

alter table public.transactions
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

comment on column public.transactions.user_id is 'Owner; set only from server session.';

-- Привязать старые строки без владельца к вашему аккаунту:
update public.transactions t
set user_id = u.id
from auth.users u
where t.user_id is null
  and u.email = 'YOUR_EMAIL@example.com';

-- Строки без user_id после update — удалить или задайте email выше.
delete from public.transactions where user_id is null;

alter table public.transactions
  alter column user_id set not null;

drop policy if exists "transactions_select_all" on public.transactions;
drop policy if exists "transactions_insert_all" on public.transactions;
drop policy if exists "transactions_update_all" on public.transactions;
drop policy if exists "transactions_delete_all" on public.transactions;
drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;

create policy "transactions_select_own"
  on public.transactions for select to authenticated
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert to authenticated
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete to authenticated
  using (auth.uid() = user_id);

-- После: Project Settings → API → Reload schema.
