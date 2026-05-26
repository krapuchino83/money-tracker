import { NextResponse } from "next/server";

import { convertPaymentToRub } from "@/lib/nbrb/fetch-rates";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { rowToTransaction } from "@/lib/types";
import { sortTransactionsByDateDesc } from "@/lib/transactions/sort";
import {
  transactionCreateSchema,
  transactionIdSchema,
  transactionUpdateSchema,
} from "@/lib/validations/transaction";

function envErrorResponse() {
  return NextResponse.json(
    { error: "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_* env)." },
    { status: 503 },
  );
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type TxRow = {
  id: number;
  amount: unknown;
  type: string;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  payment_currency?: string | null;
  payment_amount?: unknown;
  exchange_rate?: unknown;
  rate_date?: string | null;
};

function mapRows(data: unknown[] | null) {
  return sortTransactionsByDateDesc(
    (data ?? []).map((row) => rowToTransaction(row as TxRow)),
  );
}

export async function GET() {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    return envErrorResponse();
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorized();
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mapRows(data));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    return envErrorResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = transactionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return unauthorized();
  }

  const { type, payment_currency, payment_amount, category, description, date } = parsed.data;
  const dateIso = date.toISOString().slice(0, 10);

  let amountRub: number;
  let exchangeRate: number;
  let rateDate: string;
  try {
    const converted = await convertPaymentToRub(payment_currency, payment_amount, dateIso);
    amountRub = converted.amountRub;
    exchangeRate = converted.exchangeRate;
    rateDate = converted.rateDate;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка курса НБРБ";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
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
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToTransaction(data as TxRow), { status: 201 });
}

export async function PATCH(request: Request) {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    return envErrorResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = transactionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return unauthorized();
  }

  const { id, type, payment_currency, payment_amount, category, description, date } = parsed.data;
  const dateIso = date.toISOString().slice(0, 10);

  let amountRub: number;
  let exchangeRate: number;
  let rateDate: string;
  try {
    const converted = await convertPaymentToRub(payment_currency, payment_amount, dateIso);
    amountRub = converted.amountRub;
    exchangeRate = converted.exchangeRate;
    rateDate = converted.rateDate;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка курса НБРБ";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data, error } = await supabase
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
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(rowToTransaction(data as TxRow));
}

export async function DELETE(request: Request) {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    return envErrorResponse();
  }

  const idRaw = new URL(request.url).searchParams.get("id");
  const parsed = transactionIdSchema.safeParse({ id: idRaw });
  if (!parsed.success) {
    return NextResponse.json({ error: "Query ?id= is required and must be a positive integer" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return unauthorized();
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
