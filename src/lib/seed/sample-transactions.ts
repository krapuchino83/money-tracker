import type { PaymentCurrency, TransactionCategory, TransactionType } from "@/lib/types";

export const SAMPLE_MARKER = "(пример)";

export type SampleTransaction = {
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  payment_currency: PaymentCurrency;
  payment_amount: number;
  /** День текущего календарного месяца (1–28). */
  day: number;
};

/** Примеры доходов и расходов за текущий месяц. */
export const SAMPLE_TRANSACTIONS: SampleTransaction[] = [
  {
    type: "income",
    category: "Зарплата",
    description: `Оклад за месяц ${SAMPLE_MARKER}`,
    payment_currency: "RUB",
    payment_amount: 85_000,
    day: 5,
  },
  {
    type: "income",
    category: "Фриланс",
    description: `Проект для клиента ${SAMPLE_MARKER}`,
    payment_currency: "RUB",
    payment_amount: 12_000,
    day: 12,
  },
  {
    type: "income",
    category: "Фриланс",
    description: `Оплата в долларах ${SAMPLE_MARKER}`,
    payment_currency: "USD",
    payment_amount: 200,
    day: 15,
  },
  {
    type: "expense",
    category: "Еда",
    description: `Продукты и кафе ${SAMPLE_MARKER}`,
    payment_currency: "RUB",
    payment_amount: 5_200,
    day: 2,
  },
  {
    type: "expense",
    category: "Транспорт",
    description: `Проездной и такси ${SAMPLE_MARKER}`,
    payment_currency: "RUB",
    payment_amount: 1_890,
    day: 7,
  },
  {
    type: "expense",
    category: "Развлечения",
    description: `Кино и подписки ${SAMPLE_MARKER}`,
    payment_currency: "RUB",
    payment_amount: 3_400,
    day: 18,
  },
  {
    type: "expense",
    category: "Прочее",
    description: `SaaS-подписка ${SAMPLE_MARKER}`,
    payment_currency: "USD",
    payment_amount: 25,
    day: 10,
  },
  {
    type: "expense",
    category: "Прочее",
    description: `Мелкие покупки ${SAMPLE_MARKER}`,
    payment_currency: "RUB",
    payment_amount: 650,
    day: 22,
  },
];

export function sampleDateIso(day: number, now = new Date()): string {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const clamped = Math.min(Math.max(day, 1), 28);
  return `${y}-${String(m).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}
