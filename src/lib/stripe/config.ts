export type ProBillingInterval = "month" | "year";

/** Checkout и UI: secret + оба price id. Webhook не обязателен (есть /api/stripe/confirm). */
export function isStripeCheckoutReady(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_MONTHLY?.trim() &&
      process.env.STRIPE_PRICE_YEARLY?.trim(),
  );
}

export function isStripeWebhookReady(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

/** @deprecated alias */
export function isStripeConfigured(): boolean {
  return isStripeCheckoutReady();
}

export function getStripePriceId(interval: ProBillingInterval): string | null {
  const id =
    interval === "month"
      ? process.env.STRIPE_PRICE_MONTHLY
      : process.env.STRIPE_PRICE_YEARLY;
  return id?.trim() || null;
}
