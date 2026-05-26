-- PRO subscription via Stripe (Money Tracker)
-- Выполнять после 0003 (profiles) и миграций валюты/переводов (0004–0006).
-- Безопасно повторно: ADD COLUMN IF NOT EXISTS.

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text not null default 'none'
    check (
      subscription_status in (
        'none',
        'active',
        'trialing',
        'past_due',
        'canceled',
        'unpaid',
        'incomplete',
        'incomplete_expired',
        'paused'
      )
    ),
  add column if not exists pro_current_period_end timestamptz;

comment on column public.profiles.stripe_customer_id is 'Stripe Customer id (cus_...)';
comment on column public.profiles.stripe_subscription_id is 'Stripe Subscription id (sub_...)';
comment on column public.profiles.subscription_status is 'Mirrors Stripe subscription.status';
comment on column public.profiles.pro_current_period_end is 'End of current billing period (UTC)';

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;
