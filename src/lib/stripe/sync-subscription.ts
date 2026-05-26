import "server-only";

import type Stripe from "stripe";

import {
  clearProfileSubscription,
  updateProfileFromStripeSubscription,
} from "@/lib/subscription/pro";

function resolveUserId(subscription: Stripe.Subscription): string | null {
  const fromMeta = subscription.metadata?.supabase_user_id?.trim();
  if (fromMeta) return fromMeta;
  return null;
}

function customerId(subscription: Stripe.Subscription): string {
  const c = subscription.customer;
  return typeof c === "string" ? c : c.id;
}

function periodEnd(subscription: Stripe.Subscription): Date | null {
  const items = subscription.items?.data ?? [];
  const ends = items
    .map((item) => item.current_period_end)
    .filter((n): n is number => typeof n === "number" && n > 0);
  const end = ends.length > 0 ? Math.max(...ends) : null;
  if (end != null) {
    return new Date(end * 1000);
  }
  if (typeof subscription.cancel_at === "number" && subscription.cancel_at > 0) {
    return new Date(subscription.cancel_at * 1000);
  }
  return null;
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = resolveUserId(subscription);
  if (!userId) return;

  if (
    subscription.status === "canceled" ||
    subscription.status === "incomplete_expired" ||
    subscription.status === "unpaid"
  ) {
    await clearProfileSubscription(userId);
    return;
  }

  await updateProfileFromStripeSubscription({
    userId,
    customerId: customerId(subscription),
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: periodEnd(subscription),
  });
}
