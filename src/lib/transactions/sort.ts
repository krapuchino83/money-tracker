import type { Transaction } from "@/lib/types";

/** Новые операции сверху: по дате, затем по времени создания. */
export function sortTransactionsByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) {
      return byDate;
    }
    return b.created_at.localeCompare(a.created_at);
  });
}
