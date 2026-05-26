import "server-only";

import type Stripe from "stripe";

import { syncStripeSubscription } from "@/lib/stripe/sync-subscription";
import { createAdminClient } from "@/lib/supabase/admin";

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  expectedUserId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sessionUserId =
    session.metadata?.supabase_user_id?.trim() ??
    session.client_reference_id?.trim() ??
    null;

  if (!sessionUserId || sessionUserId !== expectedUserId) {
    return { ok: false, error: "Сессия оплаты не принадлежит этому аккаунту." };
  }

  if (session.mode !== "subscription") {
    return { ok: false, error: "Неверный тип сессии." };
  }

  if (session.status !== "complete") {
    return { ok: false, error: "Оплата ещё не подтверждена." };
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (customerId) {
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", expectedUserId);
  }

  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subId) {
    return { ok: false, error: "Подписка не найдена в сессии." };
  }

  const { getStripe } = await import("@/lib/stripe/server");
  const subscription = await getStripe().subscriptions.retrieve(subId);
  await syncStripeSubscription(subscription);

  return { ok: true };
}
