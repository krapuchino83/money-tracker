import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getRequestPublicOrigin } from "@/lib/public-origin";
import {
  getStripePriceId,
  isStripeCheckoutReady,
  type ProBillingInterval,
} from "@/lib/stripe/config";
import { getStripe, requireStripeCheckoutReady } from "@/lib/stripe/server";
import { getProfileProFields } from "@/lib/subscription/pro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  interval: z.enum(["month", "year"]),
});

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

  let interval: ProBillingInterval;
  try {
    const json = await request.json();
    interval = bodySchema.parse(json).interval;
  } catch {
    return NextResponse.json({ error: "Некорректный период подписки." }, { status: 400 });
  }

  const priceId = getStripePriceId(interval);
  if (!priceId) {
    return NextResponse.json({ error: "Цена подписки не настроена." }, { status: 503 });
  }

  try {
    requireStripeCheckoutReady();
    const stripe = getStripe();
    const profile = await getProfileProFields(user.id);
    const origin = getRequestPublicOrigin(request);

    let customerId = profile?.stripe_customer_id ?? undefined;

    if (!customerId) {
      const admin = createAdminClient();
      const { data: row } = await admin
        .from("profiles")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      customerId = row?.stripe_customer_id ?? undefined;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : (user.email ?? undefined),
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?pro=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?pro=cancel`,
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Не удалось создать сессию оплаты." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
