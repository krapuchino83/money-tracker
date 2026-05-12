import { z } from "zod";

import { TRANSACTION_CATEGORIES } from "@/lib/types";

const categorySchema = z.enum(TRANSACTION_CATEGORIES);

/** Shared fields for create / update (form + server action). */
export const transactionFieldsSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce
    .number()
    .refine((n) => Number.isFinite(n) && n >= 1, { message: "Сумма не меньше 1" }),
  category: categorySchema,
  description: z
    .string()
    .max(280, { message: "Не больше 280 символов" })
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  date: z.coerce.date(),
});

export type TransactionFieldsInput = z.infer<typeof transactionFieldsSchema>;

export const transactionCreateSchema = transactionFieldsSchema;

export const transactionUpdateSchema = transactionFieldsSchema.extend({
  id: z.coerce.number().int().positive(),
});

export const transactionIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
