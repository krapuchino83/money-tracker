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

export type TransactionType = "income" | "expense";

/** Application model aligned with `public.transactions`. */
export type Transaction = {
  id: number;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string | null;
  /** ISO date string `YYYY-MM-DD` */
  date: string;
  /** ISO timestamp */
  created_at: string;
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

/** Map PostgREST / Supabase row to `Transaction` (numeric → number). */
export function rowToTransaction(row: {
  id: number | string;
  amount: unknown;
  type: string;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}): Transaction {
  if (row.type !== "income" && row.type !== "expense") {
    throw new TypeError(`Invalid transaction type: ${row.type}`);
  }
  const category = row.category as TransactionCategory;
  if (!TRANSACTION_CATEGORIES.includes(category)) {
    throw new TypeError(`Invalid category: ${row.category}`);
  }
  return {
    id: typeof row.id === "string" ? Number.parseInt(row.id, 10) : row.id,
    amount: parseAmount(row.amount),
    type: row.type,
    category,
    description: row.description,
    date: row.date,
    created_at: row.created_at,
  };
}
