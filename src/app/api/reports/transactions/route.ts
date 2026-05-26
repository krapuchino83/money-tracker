import { NextResponse } from "next/server";

import { csvDownloadFilename, transactionsToCsv } from "@/lib/reports/transactions-csv";
import { getCurrentUserIsPro } from "@/lib/subscription/pro";
import { createClient } from "@/lib/supabase/server";
import { sortTransactionsByDateDesc } from "@/lib/transactions/sort";
import { rowToTransaction } from "@/lib/types";

export async function GET() {
  const isPro = await getCurrentUserIsPro();
  if (!isPro) {
    return NextResponse.json(
      { error: "Экспорт доступен только подписчикам PRO." },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transactions = sortTransactionsByDateDesc((data ?? []).map((row) => rowToTransaction(row)));
  const csv = transactionsToCsv(transactions);
  const filename = csvDownloadFilename();

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
