-- Валюта оплаты и курс НБРБ; amount — сумма в ₽ (база счёта).

alter table public.transactions
  add column if not exists payment_currency text not null default 'RUB'
    check (payment_currency in ('RUB', 'USD')),
  add column if not exists payment_amount numeric(12, 2) not null default 0,
  add column if not exists exchange_rate numeric(12, 6) not null default 1,
  add column if not exists rate_date date;

comment on column public.transactions.amount is 'Сумма в российских рублях (база счёта).';
comment on column public.transactions.payment_currency is 'Валюта, в которой пользователь оплатил.';
comment on column public.transactions.payment_amount is 'Сумма в валюте оплаты.';
comment on column public.transactions.exchange_rate is 'Курс: ₽ за 1 ед. payment_currency на rate_date.';
comment on column public.transactions.rate_date is 'Дата официального курса НБРБ.';

-- Существующие строки: оплата в ₽, payment_amount = amount.
update public.transactions
set
  payment_amount = amount,
  payment_currency = 'RUB',
  exchange_rate = 1,
  rate_date = date
where payment_amount = 0 or payment_amount is null;

alter table public.transactions
  alter column payment_amount drop default;
