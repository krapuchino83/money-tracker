import { NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { rowToTransaction } from "@/lib/types";

export async function GET() {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_* env)." },
      { status: 503 },
    );
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

    const rows = (data ?? []).map((row) =>
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

    return NextResponse.json(rows);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
