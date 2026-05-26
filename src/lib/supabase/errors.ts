/** Человекочитаемое сообщение об ошибках PostgREST / Supabase. */
const COLUMN_MIGRATIONS: Record<string, string> = {
  user_id: "0002_transactions_user_rls.sql (колонка user_id и RLS)",
  payment_currency: "0004_transactions_currency.sql",
  payment_amount: "0004_transactions_currency.sql",
  exchange_rate: "0004_transactions_currency.sql",
  rate_date: "0004_transactions_currency.sql",
  transfer_to_currency: "0005_wallet_transfers.sql",
  transfer_to_amount: "0005_wallet_transfers.sql",
};

function migrationHint(col: string | undefined): string {
  if (col && COLUMN_MIGRATIONS[col]) {
    return `supabase/migrations/${COLUMN_MIGRATIONS[col]}`;
  }
  return (
    "миграции по порядку: 0001 → 0002 → 0003 → 0004 → 0005 " +
    "(или один файл 0004_0005_currency_and_transfers.sql для валют)"
  );
}

export function formatSupabaseError(message: string): string {
  if (/schema cache|Could not find the/i.test(message)) {
    const col = message.match(/'(\w+)' column/)?.[1];
    return (
      "Схема базы устарела" +
      (col ? ` (нет колонки «${col}»)` : "") +
      `. Откройте Supabase → SQL Editor и выполните ${migrationHint(col)}. ` +
      "После этого: Project Settings → API → Reload schema."
    );
  }
  return message;
}
