"use server";

import { revalidatePath } from "next/cache";

import { convertPaymentToRub, convertWalletTransfer } from "@/lib/nbrb/fetch-rates";
import type { PaymentCurrency } from "@/lib/nbrb/types";
import { createClient } from "@/lib/supabase/server";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  transactionCreateSchema,
  transactionIdSchema,
  transactionUpdateSchema,
} from "@/lib/validations/transaction";
import { transferCreateSchema } from "@/lib/validations/transfer";
import {
  SAMPLE_TRANSACTIONS,
  sampleDateIso,
} from "@/lib/seed/sample-transactions";
import type { TransactionCategory, TransactionType } from "@/lib/types";

function formDataToCreateInput(formData: FormData) {
  return {
    type: formData.get("type"),
    payment_currency: formData.get("payment_currency") ?? "RUB",
    payment_amount: formData.get("payment_amount"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    date: formData.get("date"),
  };
}

function formDataToUpdateInput(formData: FormData) {
  return {
    ...formDataToCreateInput(formData),
    id: formData.get("id"),
  };
}

async function resolveAmountRub(
  paymentCurrency: PaymentCurrency,
  paymentAmount: number,
  dateIso: string,
) {
  return convertPaymentToRub(paymentCurrency, paymentAmount, dateIso);
}

export async function addTransaction(formData: FormData) {
  const parsed = transactionCreateSchema.safeParse(formDataToCreateInput(formData));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const { type, payment_currency, payment_amount, category, description, date } = parsed.data;
  const dateIso = date.toISOString().slice(0, 10);

  let amountRub: number;
  let exchangeRate: number;
  let rateDate: string;
  try {
    const converted = await resolveAmountRub(payment_currency, payment_amount, dateIso);
    amountRub = converted.amountRub;
    exchangeRate = converted.exchangeRate;
    rateDate = converted.rateDate;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка курса НБРБ";
    return { ok: false as const, error: msg };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Требуется вход" };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type,
    amount: amountRub,
    payment_currency,
    payment_amount,
    exchange_rate: exchangeRate,
    rate_date: rateDate,
    category,
    description,
    date: dateIso,
  });

  if (error) {
    return { ok: false as const, error: formatSupabaseError(error.message) };
  }

  revalidatePath("/");
  return { ok: true as const };
}

export async function updateTransaction(formData: FormData) {
  const parsed = transactionUpdateSchema.safeParse(formDataToUpdateInput(formData));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const { id, type, payment_currency, payment_amount, category, description, date } = parsed.data;
  const dateIso = date.toISOString().slice(0, 10);

  let amountRub: number;
  let exchangeRate: number;
  let rateDate: string;
  try {
    const converted = await resolveAmountRub(payment_currency, payment_amount, dateIso);
    amountRub = converted.amountRub;
    exchangeRate = converted.exchangeRate;
    rateDate = converted.rateDate;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка курса НБРБ";
    return { ok: false as const, error: msg };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Требуется вход" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      type,
      amount: amountRub,
      payment_currency,
      payment_amount,
      exchange_rate: exchangeRate,
      rate_date: rateDate,
      category,
      description,
      date: dateIso,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false as const, error: formatSupabaseError(error.message) };
  }

  revalidatePath("/");
  return { ok: true as const };
}

function formDataToTransferInput(formData: FormData) {
  return {
    from_currency: formData.get("from_currency"),
    to_currency: formData.get("to_currency"),
    amount: formData.get("amount"),
    description: formData.get("description") ?? "",
    date: formData.get("date"),
  };
}

export async function addTransfer(formData: FormData) {
  const parsed = transferCreateSchema.safeParse(formDataToTransferInput(formData));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const { from_currency, to_currency, amount, description, date } = parsed.data;
  const dateIso = date.toISOString().slice(0, 10);

  let toAmount: number;
  let exchangeRate: number;
  let rateDate: string;
  try {
    const converted = await convertWalletTransfer(
      from_currency,
      amount,
      to_currency,
      dateIso,
    );
    toAmount = converted.toAmount;
    exchangeRate = converted.exchangeRate;
    rateDate = converted.rateDate;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка курса НБРБ";
    return { ok: false as const, error: msg };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Требуется вход" };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: "transfer",
    amount: 0,
    payment_currency: from_currency,
    payment_amount: amount,
    transfer_to_currency: to_currency,
    transfer_to_amount: toAmount,
    exchange_rate: exchangeRate,
    rate_date: rateDate,
    category: "Прочее",
    description,
    date: dateIso,
  });

  if (error) {
    return { ok: false as const, error: formatSupabaseError(error.message) };
  }

  revalidatePath("/");
  return { ok: true as const };
}

async function insertSampleRow(
  userId: string,
  sample: (typeof SAMPLE_TRANSACTIONS)[number],
) {
  const supabase = await createClient();
  const dateIso = sampleDateIso(sample.day);

  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("description", sample.description)
    .maybeSingle();

  if (existing) {
    return { inserted: false as const };
  }

  let amountRub: number;
  let exchangeRate: number;
  let rateDate: string;
  try {
    const converted = await resolveAmountRub(
      sample.payment_currency,
      sample.payment_amount,
      dateIso,
    );
    amountRub = converted.amountRub;
    exchangeRate = converted.exchangeRate;
    rateDate = converted.rateDate;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка курса НБРБ";
    return { inserted: false as const, error: msg };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    type: sample.type as TransactionType,
    amount: amountRub,
    payment_currency: sample.payment_currency,
    payment_amount: sample.payment_amount,
    exchange_rate: exchangeRate,
    rate_date: rateDate,
    category: sample.category as TransactionCategory,
    description: sample.description,
    date: dateIso,
  });

  if (error) {
    return { inserted: false as const, error: formatSupabaseError(error.message) };
  }

  return { inserted: true as const };
}

/** Добавить примеры доходов/расходов (пропускает уже существующие по описанию). */
export async function seedSampleTransactions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Требуется вход" };
  }

  let added = 0;
  for (const sample of SAMPLE_TRANSACTIONS) {
    const result = await insertSampleRow(user.id, sample);
    if ("error" in result && result.error) {
      return { ok: false as const, error: result.error };
    }
    if (result.inserted) added += 1;
  }

  revalidatePath("/");
  return { ok: true as const, added };
}

/** Если нет ни одного дохода/расхода — добавить примеры автоматически. */
export async function ensureSampleTransactions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { seeded: false as const };
  }

  const { count, error } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("type", ["income", "expense"]);

  if (error || (count ?? 0) > 0) {
    return { seeded: false as const };
  }

  const result = await seedSampleTransactions();
  return { seeded: result.ok, added: result.ok ? result.added : 0 };
}

export async function deleteTransaction(id: number) {
  const parsed = transactionIdSchema.safeParse({ id });
  if (!parsed.success) {
    return { ok: false as const, error: "Некорректный id" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Требуется вход" };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false as const, error: formatSupabaseError(error.message) };
  }

  revalidatePath("/");
  return { ok: true as const };
}
