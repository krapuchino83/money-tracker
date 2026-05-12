"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deleteTransaction } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
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
  onRowClick?: (t: Transaction) => void;
};

export function TransactionList({ transactions, onRowClick }: Props) {
  const [pending, startTransition] = useTransition();

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
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Дата</th>
            <th className="px-4 py-3 font-medium">Тип</th>
            <th className="px-4 py-3 font-medium">Категория</th>
            <th className="px-4 py-3 font-medium">Описание</th>
            <th className="px-4 py-3 font-medium text-right">Сумма</th>
            <th className="w-12 px-2 py-3" aria-label="Удалить" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className={cn(
                "border-b border-border last:border-0",
                onRowClick ? "cursor-pointer hover:bg-muted/40" : "",
              )}
              onClick={onRowClick ? () => onRowClick(t) : undefined}
            >
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
              <td className="px-2 py-2 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={pending}
                  aria-label="Удалить транзакцию"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!window.confirm("Точно удалить?")) {
                      return;
                    }
                    startTransition(async () => {
                      await deleteTransaction(t.id);
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
