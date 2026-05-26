-- Money Tracker module 7: per-user rows + RLS (auth.uid() = user_id)
-- Run after Supabase Authentication is enabled. In Dashboard:
-- Authentication → Providers → Email (and Google/GitHub if OAuth is used);
-- set Site URL and redirect URLs to include http://localhost:3000/auth/callback.

alter table public.transactions
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

comment on column public.transactions.user_id is 'Owner; set only from server session, never from client form.';

-- Module 6 seed rows have no owner; remove before NOT NULL.
delete from public.transactions;

alter table public.transactions
  alter column user_id set not null;

drop policy if exists "transactions_select_all" on public.transactions;
drop policy if exists "transactions_insert_all" on public.transactions;
drop policy if exists "transactions_update_all" on public.transactions;
drop policy if exists "transactions_delete_all" on public.transactions;

create policy "transactions_select_own"
  on public.transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions
  for delete
  to authenticated
  using (auth.uid() = user_id);
