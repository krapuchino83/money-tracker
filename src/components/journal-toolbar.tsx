"use client";

import Link from "next/link";

import { DownloadReportButton } from "@/components/pro/download-report-button";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

export type TransactionTypeFilter = TransactionType | null;

type Props = {
  typeFilter: TransactionTypeFilter;
  autoOpenAdd?: boolean;
};

function filterTab(active: boolean, label: string) {
  return cn(
    "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-all duration-200 sm:px-4",
    active
      ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/8"
      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
  );
}

export function JournalToolbar({ typeFilter, autoOpenAdd }: Props) {
  return (
    <div
      className="inline-flex max-w-full flex-col gap-1.5 rounded-2xl border border-border/60 bg-muted/45 p-1.5 sm:flex-row sm:items-center sm:rounded-full sm:gap-1"
      role="toolbar"
      aria-label="Фильтр и действия журнала"
    >
      <nav
        className="inline-flex flex-wrap gap-0.5"
        aria-label="Фильтр по типу операций"
      >
        <Link href="/" className={filterTab(!typeFilter, "Все")}>
          Все
        </Link>
        <Link href="/?type=income" className={filterTab(typeFilter === "income", "Доходы")}>
          Доходы
        </Link>
        <Link href="/?type=expense" className={filterTab(typeFilter === "expense", "Расходы")}>
          Расходы
        </Link>
        <Link href="/?type=transfer" className={filterTab(typeFilter === "transfer", "Переводы")}>
          Переводы
        </Link>
      </nav>

      <div
        className="bg-border/60 mx-1 hidden h-6 w-px shrink-0 self-center sm:block"
        aria-hidden
      />

      <div className="flex flex-wrap items-center gap-1">
        <DownloadReportButton integrated />
        <TransactionFormDialog autoOpen={autoOpenAdd} integrated />
      </div>
    </div>
  );
}
