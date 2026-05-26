/**
 * Создаёт Product + Prices ($3/mo, $30/yr) в Stripe test mode.
 * Запуск: node scripts/stripe-setup-prices.mjs
 * Читает STRIPE_SECRET_KEY из .env.local в корне проекта.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");

function loadEnvLocal() {
  if (!existsSync(envPath)) {
    console.error("Нет файла .env.local");
    process.exit(1);
  }
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) {
  console.error("Добавьте STRIPE_SECRET_KEY в .env.local");
  process.exit(1);
}

const stripe = new Stripe(key);

const products = await stripe.products.list({ limit: 20, active: true });
let product = products.data.find((p) => p.name === "Money Tracker PRO");
if (!product) {
  product = await stripe.products.create({
    name: "Money Tracker PRO",
    description: "Экспорт CSV и функции PRO",
  });
  console.log("Product:", product.id);
} else {
  console.log("Product (existing):", product.id);
}

const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
let monthly = prices.data.find(
  (p) => p.recurring?.interval === "month" && p.unit_amount === 300,
);
let yearly = prices.data.find(
  (p) => p.recurring?.interval === "year" && p.unit_amount === 3000,
);

if (!monthly) {
  monthly = await stripe.prices.create({
    product: product.id,
    unit_amount: 300,
    currency: "usd",
    recurring: { interval: "month" },
  });
}
if (!yearly) {
  yearly = await stripe.prices.create({
    product: product.id,
    unit_amount: 3000,
    currency: "usd",
    recurring: { interval: "year" },
  });
}

console.log("STRIPE_PRICE_MONTHLY=", monthly.id);
console.log("STRIPE_PRICE_YEARLY=", yearly.id);

let env = readFileSync(envPath, "utf8");
const upsert = (name, value) => {
  const re = new RegExp(`^${name}=.*$`, "m");
  const line = `${name}=${value}`;
  env = re.test(env) ? env.replace(re, line) : `${env.trimEnd()}\n${line}\n`;
};

upsert("STRIPE_PRICE_MONTHLY", monthly.id);
upsert("STRIPE_PRICE_YEARLY", yearly.id);
writeFileSync(envPath, env.endsWith("\n") ? env : `${env}\n`);
console.log("\nГотово: price id записаны в .env.local");
