import "server-only";

import Stripe from "stripe";

import { isStripeCheckoutReady } from "./config";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function requireStripeCheckoutReady(): void {
  if (!isStripeCheckoutReady()) {
    throw new Error(
      "Stripe checkout is not configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY (run npm run stripe:setup-prices).",
    );
  }
}
