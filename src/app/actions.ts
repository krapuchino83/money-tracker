"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { transactionCreateSchema } from "@/lib/validations/transaction";

function formDataToCreateInput(formData: FormData) {
  return {
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    date: formData.get("date"),
  };
}

export async function addTransaction(formData: FormData) {
  const parsed = transactionCreateSchema.safeParse(formDataToCreateInput(formData));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const { type, amount, category, description, date } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.from("transactions").insert({
    type,
    amount,
    category,
    description,
    date: date.toISOString().slice(0, 10),
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/");
  return { ok: true as const };
}
