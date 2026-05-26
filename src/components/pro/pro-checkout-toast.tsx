"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ProCheckoutToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pro = searchParams.get("pro");
  const sessionId = searchParams.get("session_id");
  const [confirmState, setConfirmState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (pro !== "success" || !sessionId || confirmState !== "idle") return;

    setConfirmState("loading");
    void (async () => {
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) {
          setConfirmError(data.error ?? "Не удалось активировать PRO.");
          setConfirmState("error");
          return;
        }
        setConfirmState("done");
        router.refresh();
      } catch {
        setConfirmError("Сетевая ошибка при активации PRO.");
        setConfirmState("error");
      }
    })();
  }, [pro, sessionId, confirmState, router]);

  useEffect(() => {
    if (pro !== "success" && pro !== "cancel") return;

    const t = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("pro");
      url.searchParams.delete("session_id");
      router.replace(url.pathname + url.search, { scroll: false });
    }, 8000);

    return () => window.clearTimeout(t);
  }, [pro, router]);

  if (pro === "success") {
    const message =
      confirmState === "loading"
        ? "Подтверждаем оплату и активируем PRO…"
        : confirmState === "done"
          ? "PRO активирован. Можно скачивать отчёт в CSV."
          : confirmState === "error"
            ? (confirmError ??
              "Оплата прошла, но активация задержалась. Обновите страницу через минуту.")
            : "Спасибо! Активируем подписку PRO…";

    return (
      <div
        className="border-primary/30 bg-primary/10 text-foreground mb-6 rounded-xl border px-4 py-3 text-sm"
        role="status"
      >
        {message}
      </div>
    );
  }

  if (pro === "cancel") {
    return (
      <div
        className="border-border/70 bg-muted/50 text-muted-foreground mb-6 rounded-xl border px-4 py-3 text-sm"
        role="status"
      >
        Оплата отменена. Вы можете оформить PRO в любой момент.
      </div>
    );
  }

  return null;
}
