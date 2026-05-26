import type { Transaction } from "@/lib/types";

const TYPE_LABELS: Record<Transaction["type"], string> = {
  income: "Доход",
  expense: "Расход",
  transfer: "Перевод",
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function row(values: string[]): string {
  return values.map(escapeCsvCell).join(",");
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const header = row([
    "Дата",
    "Тип",
    "Валюта",
    "Категория",
    "Описание",
    "Сумма (₽)",
    "Сумма оплаты",
    "Валюта оплаты",
    "Курс USD",
    "Дата курса",
    "Валюта зачисления",
    "Сумма зачисления",
  ]);

  const lines = transactions.map((t) =>
    row([
      t.date,
      TYPE_LABELS[t.type],
      t.payment_currency,
      t.category,
      t.description ?? "",
      String(t.amount),
      String(t.payment_amount),
      t.payment_currency,
      String(t.exchange_rate),
      t.rate_date ?? "",
      t.transfer_to_currency ?? "",
      t.transfer_to_amount != null ? String(t.transfer_to_amount) : "",
    ]),
  );

  return "\uFEFF" + [header, ...lines].join("\r\n");
}

export function csvDownloadFilename(): string {
  const d = new Date().toISOString().slice(0, 10);
  return `money-tracker-${d}.csv`;
}
