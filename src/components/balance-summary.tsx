import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";

type Props = {
  transactions: Transaction[];
};

function monthPrefix(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Aggregates for the current calendar month in the runtime local timezone. */
export function BalanceSummary({ transactions }: Props) {
  const prefix = monthPrefix(new Date());
  const inMonth = transactions.filter((t) => t.date.startsWith(prefix));

  let income = 0;
  let expense = 0;
  for (const t of inMonth) {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  }
  const balance = income - expense;

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Доходы за месяц
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
            {formatMoney(income)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Расходы за месяц
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold tracking-tight text-red-600 tabular-nums dark:text-red-400">
            {formatMoney(expense)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">Баланс</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={
              balance >= 0
                ? "text-xl font-semibold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400"
                : "text-xl font-semibold tracking-tight text-red-600 tabular-nums dark:text-red-400"
            }
          >
            {formatMoney(balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
