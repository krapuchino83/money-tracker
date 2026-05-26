"use client";

import { forwardRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { ProBillingInterval } from "@/lib/stripe/config";

type Props = {
  isPro: boolean;
  stripeEnabled: boolean;
};

export const ProSubscriptionDialog = forwardRef<HTMLDialogElement, Props>(
  function ProSubscriptionDialog({ isPro, stripeEnabled }, ref) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function startCheckout(interval: ProBillingInterval) {
      setError(null);
      startTransition(async () => {
        try {
          const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interval }),
          });
          const data = (await res.json()) as { url?: string; error?: string };
          if (!res.ok || !data.url) {
            setError(data.error ?? "Не удалось открыть оплату.");
            return;
          }
          window.location.href = data.url;
        } catch {
          setError("Сетевая ошибка. Попробуйте ещё раз.");
        }
      });
    }

    function openPortal() {
      setError(null);
      startTransition(async () => {
        try {
          const res = await fetch("/api/stripe/portal", { method: "POST" });
          const data = (await res.json()) as { url?: string; error?: string };
          if (!res.ok || !data.url) {
            setError(data.error ?? "Не удалось открыть кабинет подписки.");
            return;
          }
          window.location.href = data.url;
        } catch {
          setError("Сетевая ошибка. Попробуйте ещё раз.");
        }
      });
    }

    function closeDialog() {
      if (ref && "current" in ref && ref.current) {
        ref.current.close();
      }
    }

    return (
      <dialog
        ref={ref}
        className="fixed inset-0 z-[100] m-auto w-[min(100%-2rem,24rem)] rounded-2xl border border-border/60 bg-card/95 p-0 shadow-2xl ring-1 ring-foreground/[0.06] backdrop:bg-black/45 backdrop:backdrop-blur-[2px] open:flex open:flex-col"
        onClose={() => setError(null)}
      >
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-primary text-[11px] font-semibold tracking-[0.18em] uppercase">
            Money Tracker PRO
          </p>
          <h2 className="font-display mt-1 text-lg tracking-tight">
            {isPro ? "Подписка активна" : "Оформите PRO"}
          </h2>
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
            {isPro
              ? "Экспорт журнала в CSV и другие PRO-возможности доступны."
              : "Скачивание отчёта в CSV и расширенные возможности — только для подписчиков."}
          </p>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {!stripeEnabled ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              Укажите ключи Stripe в <code className="text-xs">.env.local</code> и выполните{" "}
              <code className="text-xs">npm run stripe:setup-prices</code> для создания тарифов
              $3/мес и $30/год.
            </p>
          ) : isPro ? (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              disabled={pending}
              onClick={openPortal}
            >
              Управление подпиской
            </Button>
          ) : (
            <>
              <div className="grid gap-2">
                <Button
                  type="button"
                  className="h-auto w-full flex-col gap-0.5 rounded-xl py-3"
                  disabled={pending}
                  onClick={() => startCheckout("month")}
                >
                  <span className="font-semibold">$3 / месяц</span>
                  <span className="text-primary-foreground/80 text-xs font-normal">
                    Ежемесячная подписка
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto w-full flex-col gap-0.5 rounded-xl py-3"
                  disabled={pending}
                  onClick={() => startCheckout("year")}
                >
                  <span className="font-semibold">$30 / год</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    Экономия $6 в год
                  </span>
                </Button>
              </div>
              <p className="text-muted-foreground text-center text-[11px] leading-relaxed">
                Оплата через Stripe. Можно отменить в любой момент.
              </p>
            </>
          )}

          {error ? (
            <p className="text-destructive text-center text-xs leading-relaxed" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="button" variant="ghost" className="rounded-full" onClick={closeDialog}>
            Закрыть
          </Button>
        </div>
      </dialog>
    );
  },
);
