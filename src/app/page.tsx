import Link from "next/link";

import { BalanceSummary } from "@/components/balance-summary";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { TransactionsBoard } from "@/components/transactions-board";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { rowToTransaction } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ add?: string; type?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const autoOpenAdd = sp.add === "1";

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Money Tracker</h1>
        <p className="mt-4 text-muted-foreground">
          Добавьте в корень проекта файл{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">.env.local</code> с
          переменными{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> и{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (или{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
          ), см.{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">.env.example</code>
          ), затем выполните SQL-миграцию в Supabase.
        </p>
      </main>
    );
  }

  const typeFilter =
    sp.type === "income" || sp.type === "expense" ? (sp.type as "income" | "expense") : null;

  const supabase = await createClient();
  const { data: allRows, error: allError } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (allError) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Money Tracker</h1>
        <p className="mt-4 text-destructive">
          Ошибка загрузки данных: {allError.message}. Проверьте таблицу{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">transactions</code> и
          ключи Supabase.
        </p>
      </main>
    );
  }

  const transactions = (allRows ?? []).map((row) =>
    rowToTransaction(
      row as {
        id: number;
        amount: unknown;
        type: string;
        category: string;
        description: string | null;
        date: string;
        created_at: string;
      },
    ),
  );

  /** PRD: фильтр через query к Supabase; баланс считается по полному списку. */
  let tableTransactions = transactions;
  if (typeFilter) {
    const { data: filteredRows, error: filterError } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", typeFilter)
      .order("date", { ascending: false });

    if (filterError) {
      return (
        <main className="mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Money Tracker</h1>
          <p className="mt-4 text-destructive">Ошибка фильтра: {filterError.message}</p>
        </main>
      );
    }
    tableTransactions = (filteredRows ?? []).map((row) =>
      rowToTransaction(
        row as {
          id: number;
          amount: unknown;
          type: string;
          category: string;
          description: string | null;
          date: string;
          created_at: string;
        },
      ),
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Money Tracker</h1>
            <p className="text-muted-foreground text-sm">
              Карточки — по текущему месяцу; таблица — с учётом фильтра по типу.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: typeFilter ? "outline" : "secondary", size: "sm" }),
              )}
            >
              Все
            </Link>
            <Link
              href="/?type=income"
              className={cn(
                buttonVariants({
                  variant: typeFilter === "income" ? "secondary" : "outline",
                  size: "sm",
                }),
              )}
            >
              Только доходы
            </Link>
            <Link
              href="/?type=expense"
              className={cn(
                buttonVariants({
                  variant: typeFilter === "expense" ? "secondary" : "outline",
                  size: "sm",
                }),
              )}
            >
              Только расходы
            </Link>
          </nav>
        </div>
        <TransactionFormDialog autoOpen={autoOpenAdd} />
      </header>
      <BalanceSummary transactions={transactions} />
      <TransactionsBoard transactions={tableTransactions} />
    </main>
  );
}
