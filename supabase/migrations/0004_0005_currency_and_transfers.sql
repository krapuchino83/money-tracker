-- Валюты + переводы между кошельками (0004 + 0005, можно выполнить одним скриптом).
-- Supabase → SQL Editor → New query → Run.

-- === 0004: валюта оплаты и курс НБРБ ===
alter table public.transactions
  add column if not exists payment_currency text not null default 'RUB'
    check (payment_currency in ('RUB', 'USD')),
  add column if not exists payment_amount numeric(12, 2) not null default 0,
  add column if not exists exchange_rate numeric(12, 6) not null default 1,
  add column if not exists rate_date date;

comment on column public.transactions.amount is 'Сумма в российских рублях (база счёта).';
comment on column public.transactions.payment_currency is 'Валюта, в которой пользователь оплатил.';
comment on column public.transactions.payment_amount is 'Сумма в валюте оплаты.';
comment on column public.transactions.exchange_rate is 'Курс: ₽ за 1 USD на rate_date.';
comment on column public.transactions.rate_date is 'Дата официального курса НБРБ.';

update public.transactions
set
  payment_amount = amount,
  payment_currency = 'RUB',
  exchange_rate = 1,
  rate_date = date
where payment_amount = 0 or payment_amount is null;

alter table public.transactions
  alter column payment_amount drop default;

-- === 0005: переводы между кошельками ===
alter table public.transactions
  drop constraint if exists transactions_type_check;

alter table public.transactions
  add constraint transactions_type_check
  check (type in ('income', 'expense', 'transfer'));

alter table public.transactions
  drop constraint if exists transactions_amount_check;

alter table public.transactions
  add constraint transactions_amount_check
  check (amount >= 0);

alter table public.transactions
  add column if not exists transfer_to_currency text
    check (transfer_to_currency is null or transfer_to_currency in ('RUB', 'USD')),
  add column if not exists transfer_to_amount numeric(12, 2);

comment on column public.transactions.transfer_to_currency is 'Кошелёк-получатель при type=transfer.';
comment on column public.transactions.transfer_to_amount is 'Сумма зачисления в валюте transfer_to_currency.';

-- После выполнения: Project Settings → API → Reload schema (если ошибка не исчезла сразу).
