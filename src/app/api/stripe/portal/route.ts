import { NextResponse, type NextRequest } from "next/server";

import { getRequestPublicOrigin } from "@/lib/public-origin";
import { isStripeCheckoutReady } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { getProfileProFields } from "@/lib/subscription/pro";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isStripeCheckoutReady()) {
    return NextResponse.json({ error: "Оплата не настроена на сервере." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Требуется вход в аккаунт." }, { status: 401 });
  }

  const profile = await getProfileProFields(user.id);
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "Нет активной подписки Stripe." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const origin = getRequestPublicOrigin(request);
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
