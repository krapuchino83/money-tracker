"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deleteTransaction } from "@/app/actions";
import { useCurrencyRates } from "@/components/currency-rates-provider";
import { TransactionAmountDisplay } from "@/components/transaction-amount-display";
import { TransferAmountDisplay } from "@/components/transfer-amount-display";
import { Button, buttonVariants } from "@/components/ui/button";
import { sortTransactionsByDateDesc } from "@/lib/transactions/sort";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/lib/types";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso + "T12:00:00"));
}

type Props = {
  transactions: Transaction[];
  typeFilter?: TransactionType | null;
  onRowClick?: (t: Transaction) => void;
};

const FILTER_EMPTY: Record<TransactionType, string> = {
  income: "Нет доходов за выбранный период.",
  expense: "Нет расходов.",
  transfer: "Нет переводов между кошельками.",
};

export function TransactionList({ transactions, typeFilter = null, onRowClick }: Props) {
  const [pending, startTransition] = useTransition();
  const { formatDisplay } = useCurrencyRates();
  const sorted = sortTransactionsByDateDesc(transactions);

  if (sorted.length === 0) {
    return (
      <div className="bento-card rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center md:px-10">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {typeFilter
            ? FILTER_EMPTY[typeFilter]
            : "Пока нет ни одной транзакции — добавьте первую и начните обзор в пару кликов."}
        </p>
        {typeFilter ? (
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "mt-6 inline-flex")}
          >
            Показать все операции
          </Link>
        ) : (
          <Link
            href="/?add=1"
            className={cn(buttonVariants({ size: "default" }), "mt-6 inline-flex")}
          >
            Добавить первую
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bento-card overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-gradient-to-b from-muted/90 to-muted/35 text-muted-foreground">
            <th className="px-5 py-3.5 text-xs font-semibold tracking-wide uppercase">Дата</th>
            <th className="px-5 py-3.5 text-xs font-semibold tracking-wide uppercase">Тип</th>
            <th className="px-5 py-3.5 text-xs font-semibold tracking-wide uppercase">Валюта</th>
            <th className="px-5 py-3.5 text-xs font-semibold tracking-wide uppercase">
              Категория
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold tracking-wide uppercase">
              Описание
            </th>
            <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide uppercase">
              Сумма
            </th>
            <th className="w-12 px-2 py-3.5" aria-label="Удалить" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr
              key={t.id}
              className={cn(
                "border-b border-border/35 transition-colors last:border-0",
                onRowClick ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/15",
              )}
              onClick={onRowClick ? () => onRowClick(t) : undefined}
            >
              <td className="text-muted-foreground px-5 py-3.5 whitespace-nowrap tabular-nums">
                {formatDate(t.date)}
              </td>
              <td className="px-5 py-3.5">
                {t.type === "transfer" ? (
                  <span className="inline-flex rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Перевод
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      t.type === "income"
                        ? "bg-money-income/15 text-money-income"
                        : "bg-money-expense/12 text-money-expense",
                    )}
                  >
                    {t.type === "income" ? "Доход" : "Расход"}
                  </span>
                )}
              </td>
              <td className="text-muted-foreground px-5 py-3.5 text-xs font-medium">
                {t.type === "transfer" && t.transfer_to_currency
                  ? `${t.payment_currency} → ${t.transfer_to_currency}`
                  : t.payment_currency}
              </td>
              <td className="px-5 py-3.5 font-medium">
                {t.type === "transfer" ? "Перевод" : t.category}
              </td>
              <td className="text-muted-foreground max-w-[200px] truncate px-5 py-3.5">
                {t.description ?? "—"}
              </td>
              <td className="px-5 py-3.5 text-right">
                {t.type === "transfer" ? (
                  <TransferAmountDisplay transaction={t} />
                ) : (
                  <span
                    className={cn(
                      t.type === "income" ? "text-money-income" : "text-money-expense",
                    )}
                  >
                    <TransactionAmountDisplay
                      transaction={t}
                      primaryLabel={formatDisplay(t.amount)}
                    />
                  </span>
                )}
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
