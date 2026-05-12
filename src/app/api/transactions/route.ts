import { NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { rowToTransaction } from "@/lib/types";
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

function mapRows(data: unknown[] | null) {
  return (data ?? []).map((row) =>
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
}

export async function GET() {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    return envErrorResponse();
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

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

  const { type, amount, category, description, date } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type,
      amount,
      category,
      description,
      date: date.toISOString().slice(0, 10),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    rowToTransaction(
      data as {
        id: number;
        amount: unknown;
        type: string;
        category: string;
        description: string | null;
        date: string;
        created_at: string;
      },
    ),
    { status: 201 },
  );
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

  const { id, type, amount, category, description, date } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      category,
      description,
      date: date.toISOString().slice(0, 10),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    rowToTransaction(
      data as {
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
  const { error } = await supabase.from("transactions").delete().eq("id", parsed.data.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
