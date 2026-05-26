import { NextResponse } from "next/server";

import { fetchKerchWeather } from "@/lib/open-meteo/fetch-weather";

export const dynamic = "force-dynamic";

/** Погода в Керчи (Open-Meteo). */
export async function GET() {
  try {
    const weather = await fetchKerchWeather();
    return NextResponse.json(weather);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка Open-Meteo";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
