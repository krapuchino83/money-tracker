import { NextResponse } from "next/server";

import { fulfillCheckoutSession } from "@/lib/stripe/checkout-session";
import { isStripeCheckoutReady } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isStripeCheckoutReady()) {
    return NextResponse.json({ error: "Stripe не настроен." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  let sessionId: string | undefined;
  try {
    const body = (await request.json()) as { session_id?: string };
    sessionId = body.session_id?.trim();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  if (!sessionId?.startsWith("cs_")) {
    return NextResponse.json({ error: "Некорректный session_id." }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const result = await fulfillCheckoutSession(session, user.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка подтверждения оплаты";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
