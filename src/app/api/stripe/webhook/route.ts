import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { fulfillCheckoutSession } from "@/lib/stripe/checkout-session";
import { isStripeWebhookReady } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { syncStripeSubscription } from "@/lib/stripe/sync-subscription";
import { updateProfileFromStripeSubscription } from "@/lib/subscription/pro";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeWebhookReady()) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!.trim();

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.metadata?.supabase_user_id?.trim() ??
          session.client_reference_id?.trim();
        if (userId) {
          await fulfillCheckoutSession(session, userId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncStripeSubscription(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id?.trim();
        if (userId) {
          await updateProfileFromStripeSubscription({
            userId,
            customerId:
              typeof sub.customer === "string" ? sub.customer : sub.customer.id,
            subscriptionId: sub.id,
            status: "canceled",
            currentPeriodEnd: null,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook handler error";
    console.error("[stripe webhook]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
