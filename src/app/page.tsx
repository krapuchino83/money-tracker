import { BalanceSummary } from "@/components/balance-summary";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { TransactionsBoard } from "@/components/transactions-board";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { rowToTransaction } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ add?: string }>;
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
          <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (см.{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">.env.example</code>
          ), затем выполните SQL-миграцию в Supabase.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Money Tracker</h1>
        <p className="mt-4 text-destructive">
          Ошибка загрузки данных: {error.message}. Проверьте таблицу{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">transactions</code> и
          ключи Supabase.
        </p>
      </main>
    );
  }

  const transactions = (data ?? []).map((row) =>
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

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Money Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Список транзакций из Supabase (Server Components).
          </p>
        </div>
        <TransactionFormDialog autoOpen={autoOpenAdd} />
      </header>
      <BalanceSummary transactions={transactions} />
      <TransactionsBoard transactions={transactions} />
    </main>
  );
}
