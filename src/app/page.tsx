import { Suspense } from "react";

import { ensureSampleTransactions } from "@/app/actions";
import { ProCheckoutToast } from "@/components/pro/pro-checkout-toast";
import { ProHeaderButton } from "@/components/pro/pro-header-button";
import { ProSubscriptionProvider } from "@/components/pro/pro-subscription-context";
import { WalletsSummary } from "@/components/wallets-summary";
import { CurrencyRatesProvider } from "@/components/currency-rates-provider";
import { CurrencyToggle } from "@/components/currency-toggle";
import { ExchangeRatesBar } from "@/components/exchange-rates-bar";
import { WeatherWidget } from "@/components/weather/weather-widget";
import { ThemeToggle } from "@/components/theme-toggle";
import { JournalToolbar } from "@/components/journal-toolbar";
import type { TransactionTypeFilter } from "@/components/journal-toolbar";
import { TransferFormDialog } from "@/components/transfer-form-dialog";
import { TransactionsBoard } from "@/components/transactions-board";
import { UserMenu } from "@/components/user-menu";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { fetchRubCrossRates } from "@/lib/nbrb/fetch-rates";
import type { RubCrossRates } from "@/lib/nbrb/types";
import { fetchKerchWeather } from "@/lib/open-meteo/fetch-weather";
import type { KerchWeatherData } from "@/lib/open-meteo/types";
import { isStripeCheckoutReady } from "@/lib/stripe/config";
import { getProfileProFields, isProFromProfile } from "@/lib/subscription/pro";
import { rowToTransaction } from "@/lib/types";
import { sortTransactionsByDateDesc } from "@/lib/transactions/sort";

export const dynamic = "force-dynamic";

type TxRow = {
  id: number;
  amount: unknown;
  type: string;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  payment_currency?: string | null;
  payment_amount?: unknown;
  exchange_rate?: unknown;
  rate_date?: string | null;
  transfer_to_currency?: string | null;
  transfer_to_amount?: unknown;
};

type PageProps = {
  searchParams?: Promise<{ add?: string; type?: string }>;
};

const FILTER_LABELS: Record<Exclude<TransactionTypeFilter, null>, string> = {
  income: "Доходы",
  expense: "Расходы",
  transfer: "Переводы",
};

export default async function Home({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const autoOpenAdd = sp.add === "1";

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    return (
      <main className="relative mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="absolute end-4 top-6 md:end-8">
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground mb-3 text-[11px] font-medium tracking-[0.2em] uppercase">
          Конфигурация
        </p>
        <h1 className="font-display mb-6 text-3xl md:text-4xl">
          Money Tracker
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Добавьте в корень проекта файл{" "}
          <code className="rounded-md bg-muted px-2 py-1 text-foreground">.env.local</code> с
          переменными{" "}
          <code className="rounded-md bg-muted px-2 py-1">NEXT_PUBLIC_SUPABASE_URL</code> и{" "}
          <code className="rounded-md bg-muted px-2 py-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (или{" "}
          <code className="rounded-md bg-muted px-2 py-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
          ), см.{" "}
          <code className="rounded-md bg-muted px-2 py-1">.env.example</code>
          ), затем выполните SQL-миграцию в Supabase.
        </p>
      </main>
    );
  }

  const typeFilter: TransactionTypeFilter =
    sp.type === "income" || sp.type === "expense" || sp.type === "transfer"
      ? sp.type
      : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const profile = await getProfileProFields(user.id);
    isPro = isProFromProfile(profile);
  }
  const stripeEnabled = isStripeCheckoutReady();

  await ensureSampleTransactions();

  const { data: allRows, error: allError } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (allError) {
    return (
      <main className="relative mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="absolute end-4 top-6 md:end-8">
          <ThemeToggle />
        </div>
        <h1 className="font-display mb-4 text-3xl md:text-4xl">
          Money Tracker
        </h1>
        <p className="text-destructive leading-relaxed">
          Ошибка загрузки данных: {allError.message}. Проверьте таблицу{" "}
          <code className="rounded-md bg-muted px-2 py-1 text-foreground">transactions</code> и ключи
          Supabase.
        </p>
      </main>
    );
  }

  const transactions = sortTransactionsByDateDesc(
    (allRows ?? []).map((row) => rowToTransaction(row as TxRow)),
  );

  let rubRates: RubCrossRates;
  try {
    rubRates = await fetchRubCrossRates();
  } catch {
    rubRates = {
      rateDate: new Date().toISOString().slice(0, 10),
      RUB: 1,
      USD: 0,
      EUR: 0,
      CNY: 0,
    };
  }

  let kerchWeather: KerchWeatherData | null = null;
  let weatherError: string | null = null;
  try {
    kerchWeather = await fetchKerchWeather();
  } catch (e) {
    weatherError = e instanceof Error ? e.message : "Ошибка загрузки погоды";
  }

  /** Фильтр журнала; кошельки — по полному списку. */
  const tableTransactions = typeFilter
    ? transactions.filter((t) => t.type === typeFilter)
    : transactions;

  return (
    <ProSubscriptionProvider isPro={isPro} stripeEnabled={stripeEnabled}>
    <CurrencyRatesProvider rates={rubRates}>
      <div className="min-h-screen">
        <header className="glass-bar sticky top-0 z-40">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-xl space-y-3">
              <p className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                Обзор финансов
              </p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-[2.65rem]">
                Money Tracker
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed md:text-[0.9375rem]">
                Кошельки ₽ и $, переводы между ними и общий счёт в ₽ по курсу НБРБ.
              </p>
            </div>
            <div className="flex flex-col gap-5 lg:items-end">
              <div className="flex max-w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto">
                <ProHeaderButton />
                <CurrencyToggle />
                <ThemeToggle />
                <TransferFormDialog />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <Suspense fallback={null}>
            <ProCheckoutToast />
          </Suspense>
          <ExchangeRatesBar rates={rubRates} />
          <WeatherWidget weather={kerchWeather} error={weatherError} />
          <section aria-label="Кошельки">
            <WalletsSummary transactions={transactions} />
          </section>

          <section className="mt-12 space-y-4" aria-label="Журнал операций">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl tracking-tight md:text-2xl">Журнал операций</h2>
                <p className="text-muted-foreground mt-1.5 max-w-md text-sm leading-relaxed">
                  {typeFilter
                    ? `Показаны: ${FILTER_LABELS[typeFilter]}. `
                    : null}
                  Сортировка по дате — новые сверху. Доход/расход — клик по строке для правки.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <JournalToolbar typeFilter={typeFilter} autoOpenAdd={autoOpenAdd} />
                <span className="text-muted-foreground tabular-nums text-sm font-medium">
                {tableTransactions.length}{" "}
                {tableTransactions.length === 1 ? "запись" : "записей"}
                </span>
              </div>
            </div>
            <TransactionsBoard transactions={tableTransactions} typeFilter={typeFilter} />
          </section>
        </div>
      </div>
    </CurrencyRatesProvider>
    </ProSubscriptionProvider>
  );
}
