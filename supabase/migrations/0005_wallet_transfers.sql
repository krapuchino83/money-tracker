-- Переводы между кошельками (₽ ↔ $) по курсу НБРБ.

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

-- Перевод: payment_currency/from + transfer_to_currency/to; amount=0 (не влияет на общий счёт).
