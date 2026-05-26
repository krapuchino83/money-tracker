"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrencyRates } from "@/components/currency-rates-provider";
import { formatAmountPlain } from "@/lib/currency/format";
import { computeWalletStats } from "@/lib/wallets/compute";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

type Props = {
  transactions: Transaction[];
};

function fmtWallet(amount: number, currency: "RUB" | "USD"): string {
  return formatAmountPlain(amount, currency === "USD" ? 2 : 0);
}

export function WalletsSummary({ transactions }: Props) {
  const { toDisplay } = useCurrencyRates();
  const wallets = computeWalletStats(transactions);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {wallets.map((w) => {
        const isCommon = w.id === "COMMON";
        const balanceLabel = isCommon
          ? formatAmountPlain(toDisplay(w.balance), w.balance % 1 === 0 ? 0 : 2)
          : fmtWallet(w.balance, w.currency as "RUB" | "USD");

        return (
          <Card
            key={w.id}
            className={cn(
              "bento-card h-full border-border/60 bg-card/90",
              isCommon && "border-primary/20 bg-gradient-to-br from-card/95 via-card to-primary/5",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {w.title}
              </CardTitle>
              <p className="text-muted-foreground text-xs leading-snug">{w.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide">
                  Баланс · месяц
                </p>
                <p
                  className={cn(
                    "font-display text-2xl tabular-nums md:text-3xl",
                    w.balance >= 0 ? "text-money-income" : "text-money-expense",
                  )}
                >
                  {balanceLabel}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Доходы</dt>
                  <dd className="text-money-income font-medium tabular-nums">
                    {isCommon
                      ? formatAmountPlain(toDisplay(w.income), 0)
                      : fmtWallet(w.income, w.currency as "RUB" | "USD")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Расходы</dt>
                  <dd className="text-money-expense font-medium tabular-nums">
                    {isCommon
                      ? formatAmountPlain(toDisplay(w.expense), 0)
                      : fmtWallet(w.expense, w.currency as "RUB" | "USD")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
