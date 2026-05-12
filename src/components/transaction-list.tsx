import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso + "T12:00:00"));
}

type Props = {
  transactions: Transaction[];
};

export function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">Пока нет ни одной транзакции.</p>
        <Link href="/?add=1" className={cn(buttonVariants(), "mt-4 inline-flex")}>
          Добавить первую
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Дата</th>
            <th className="px-4 py-3 font-medium">Тип</th>
            <th className="px-4 py-3 font-medium">Категория</th>
            <th className="px-4 py-3 font-medium">Описание</th>
            <th className="px-4 py-3 font-medium text-right">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 whitespace-nowrap">{formatDate(t.date)}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    t.type === "income"
                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                      : "font-medium text-red-600 dark:text-red-400"
                  }
                >
                  {t.type === "income" ? "Доход" : "Расход"}
                </span>
              </td>
              <td className="px-4 py-3">{t.category}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {t.description ?? "—"}
              </td>
              <td
                className={
                  t.type === "income"
                    ? "px-4 py-3 text-right font-medium text-emerald-600 tabular-nums dark:text-emerald-400"
                    : "px-4 py-3 text-right font-medium text-red-600 tabular-nums dark:text-red-400"
                }
              >
                {formatMoney(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
