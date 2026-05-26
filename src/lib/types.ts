/** Fixed category list from PRD (stored as text in DB). */
export const TRANSACTION_CATEGORIES = [
  "Зарплата",
  "Фриланс",
  "Еда",
  "Транспорт",
  "Развлечения",
  "Прочее",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export type TransactionType = "income" | "expense" | "transfer";

export type PaymentCurrency = "RUB" | "USD";

/** Application model aligned with `public.transactions`. */
export type Transaction = {
  id: number;
  /** Сумма в ₽ (база общего счёта; 0 для переводов). */
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string | null;
  /** ISO date string `YYYY-MM-DD` */
  date: string;
  /** ISO timestamp */
  created_at: string;
  /** Кошелёк-источник / валюта оплаты. */
  payment_currency: PaymentCurrency;
  /** Сумма списания (в payment_currency). */
  payment_amount: number;
  /** ₽ за 1 USD на rate_date (для переводов и оплаты в $). */
  exchange_rate: number;
  /** Дата курса НБРБ */
  rate_date: string | null;
  /** Кошелёк-получатель (только transfer). */
  transfer_to_currency: PaymentCurrency | null;
  /** Сумма зачисления (только transfer). */
  transfer_to_amount: number | null;
};

function parseAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const n = Number.parseFloat(value);
    if (Number.isFinite(n)) {
      return n;
    }
  }
  throw new TypeError("Invalid amount from database");
}

function parsePaymentCurrency(value: unknown): PaymentCurrency {
  if (value === "RUB" || value === "USD") return value;
  return "RUB";
}

/** Map PostgREST / Supabase row to `Transaction` (numeric → number). */
export function rowToTransaction(row: {
  id: number | string;
  amount: unknown;
  type: string;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  payment_currency?: string | null;
  payment_amount?: unknown;
  exchange_rate?: unknown;
  rate_date?: string | null;
  transfer_to_currency?: string | null;
  transfer_to_amount?: unknown;
}): Transaction {
  if (row.type !== "income" && row.type !== "expense" && row.type !== "transfer") {
    throw new TypeError(`Invalid transaction type: ${row.type}`);
  }
  const category = row.category as TransactionCategory;
  if (!TRANSACTION_CATEGORIES.includes(category)) {
    throw new TypeError(`Invalid category: ${row.category}`);
  }
  const amount = parseAmount(row.amount);
  const payment_currency = parsePaymentCurrency(row.payment_currency);
  const payment_amount =
    row.payment_amount != null ? parseAmount(row.payment_amount) : amount;
  const exchange_rate =
    row.exchange_rate != null ? parseAmount(row.exchange_rate) : 1;
  const transfer_to_currency =
    row.transfer_to_currency === "RUB" || row.transfer_to_currency === "USD"
      ? row.transfer_to_currency
      : null;
  const transfer_to_amount =
    row.transfer_to_amount != null ? parseAmount(row.transfer_to_amount) : null;

  return {
    id: typeof row.id === "string" ? Number.parseInt(row.id, 10) : row.id,
    amount,
    type: row.type,
    category,
    description: row.description,
    date: row.date,
    created_at: row.created_at,
    payment_currency,
    payment_amount,
    exchange_rate,
    rate_date: row.rate_date ?? null,
    transfer_to_currency,
    transfer_to_amount,
  };
}
