import type { PaymentCurrency, Transaction } from "@/lib/types";

export type WalletId = "RUB" | "USD" | "COMMON";

export type WalletStats = {
  id: WalletId;
  title: string;
  subtitle: string;
  currency: PaymentCurrency | "RUB";
  income: number;
  expense: number;
  balance: number;
};

function monthPrefix(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function sumIncomeExpense(
  items: Transaction[],
  pickAmount: (t: Transaction) => number,
): { income: number; expense: number } {
  let income = 0;
  let expense = 0;
  for (const t of items) {
    if (t.type === "transfer") continue;
    const v = pickAmount(t);
    if (t.type === "income") income += v;
    else expense += v;
  }
  return { income, expense };
}

function sumTransfers(
  items: Transaction[],
  wallet: PaymentCurrency,
): { in: number; out: number } {
  let inAmt = 0;
  let outAmt = 0;
  for (const t of items) {
    if (t.type !== "transfer") continue;
    if (t.payment_currency === wallet) outAmt += t.payment_amount;
    if (t.transfer_to_currency === wallet && t.transfer_to_amount != null) {
      inAmt += t.transfer_to_amount;
    }
  }
  return { in: inAmt, out: outAmt };
}

/** Кошельки за текущий календарный месяц. */
export function computeWalletStats(transactions: Transaction[], now = new Date()): WalletStats[] {
  const prefix = monthPrefix(now);
  const inMonth = transactions.filter((t) => t.date.startsWith(prefix));

  const rubItems = inMonth.filter(
    (t) => t.type !== "transfer" && t.payment_currency === "RUB",
  );
  const usdItems = inMonth.filter(
    (t) => t.type !== "transfer" && t.payment_currency === "USD",
  );
  const commonItems = inMonth.filter((t) => t.type !== "transfer");

  const rubIe = sumIncomeExpense(rubItems, (t) => t.payment_amount);
  const usdIe = sumIncomeExpense(usdItems, (t) => t.payment_amount);
  const common = sumIncomeExpense(commonItems, (t) => t.amount);

  const rubTf = sumTransfers(inMonth, "RUB");
  const usdTf = sumTransfers(inMonth, "USD");

  const rubIncome = rubIe.income + rubTf.in;
  const rubExpense = rubIe.expense + rubTf.out;
  const usdIncome = usdIe.income + usdTf.in;
  const usdExpense = usdIe.expense + usdTf.out;

  return [
    {
      id: "RUB",
      title: "Кошелёк RUB",
      subtitle: "Операции и переводы в российских рублях",
      currency: "RUB",
      income: rubIncome,
      expense: rubExpense,
      balance: rubIncome - rubExpense,
    },
    {
      id: "USD",
      title: "Кошелёк USD",
      subtitle: "Операции и переводы в долларах США",
      currency: "USD",
      income: usdIncome,
      expense: usdExpense,
      balance: usdIncome - usdExpense,
    },
    {
      id: "COMMON",
      title: "Общий счёт",
      subtitle: "Доходы и расходы в рублях (переводы не учитываются)",
      currency: "RUB",
      income: common.income,
      expense: common.expense,
      balance: common.income - common.expense,
    },
  ];
}
