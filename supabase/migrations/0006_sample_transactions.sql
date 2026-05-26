-- Примеры доходов и расходов (опционально, если не используете кнопку «Примеры» в UI).
-- Замените email на ваш логин Supabase Auth.

insert into public.transactions (
  user_id, type, amount, payment_currency, payment_amount,
  exchange_rate, rate_date, category, description, date
)
select
  u.id,
  v.type,
  v.amount,
  v.payment_currency,
  v.payment_amount,
  v.exchange_rate,
  v.rate_date,
  v.category,
  v.description,
  v.date
from auth.users u
cross join (
  values
    ('income', 85000::numeric, 'RUB', 85000::numeric, 1::numeric, current_date, 'Зарплата', 'Оклад за месяц (пример)', date_trunc('month', current_date)::date + 4),
    ('income', 12000::numeric, 'RUB', 12000::numeric, 1::numeric, current_date, 'Фриланс', 'Проект для клиента (пример)', date_trunc('month', current_date)::date + 11),
    ('expense', 5200::numeric, 'RUB', 5200::numeric, 1::numeric, current_date, 'Еда', 'Продукты и кафе (пример)', date_trunc('month', current_date)::date + 1),
    ('expense', 1890::numeric, 'RUB', 1890::numeric, 1::numeric, current_date, 'Транспорт', 'Проездной и такси (пример)', date_trunc('month', current_date)::date + 6),
    ('expense', 3400::numeric, 'RUB', 3400::numeric, 1::numeric, current_date, 'Развлечения', 'Кино и подписки (пример)', date_trunc('month', current_date)::date + 17)
) as v(type, amount, payment_currency, payment_amount, exchange_rate, rate_date, category, description, date)
where u.email = 'YOUR_EMAIL@example.com'
  and not exists (
    select 1 from public.transactions t
    where t.user_id = u.id and t.description = v.description
  );
