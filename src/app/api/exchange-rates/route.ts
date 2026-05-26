import { NextResponse } from "next/server";

import { fetchRubCrossRates } from "@/lib/nbrb/fetch-rates";

export const dynamic = "force-dynamic";

/** Курсы EUR, USD, CNY к ₽ по НБРБ. Query: ?date=YYYY-MM-DD (опционально). */
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? undefined;
  try {
    const rates = await fetchRubCrossRates(date ?? undefined);
    return NextResponse.json(rates);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка НБРБ";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
