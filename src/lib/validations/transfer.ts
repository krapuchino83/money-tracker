import { z } from "zod";

const walletCurrencySchema = z.enum(["RUB", "USD"]);

export const transferCreateSchema = z
  .object({
    from_currency: walletCurrencySchema,
    to_currency: walletCurrencySchema,
    amount: z.coerce
      .number()
      .refine((n) => Number.isFinite(n) && n >= 0.01, { message: "Сумма не меньше 0.01" }),
    description: z
      .string()
      .max(280, { message: "Не больше 280 символов" })
      .optional()
      .transform((v) => (v === "" || v === undefined ? null : v)),
    date: z.coerce.date(),
  })
  .refine((d) => d.from_currency !== d.to_currency, {
    message: "Выберите разные кошельки",
    path: ["to_currency"],
  });

export type TransferCreateInput = z.infer<typeof transferCreateSchema>;
