"use client";

import { Download } from "lucide-react";
import { useTransition } from "react";

import { useProSubscription } from "@/components/pro/pro-subscription-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Встроенная кнопка в панель журнала. */
  integrated?: boolean;
};

export function DownloadReportButton({ integrated }: Props = {}) {
  const { isPro, openPaywall } = useProSubscription();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isPro) {
      openPaywall();
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/reports/transactions");
      if (!res.ok) {
        if (res.status === 403) {
          openPaywall();
        }
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "money-tracker.csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <Button
      type="button"
      variant={integrated ? "ghost" : "outline"}
      size="sm"
      className={cn(
        "gap-1.5 shrink-0 rounded-full",
        integrated && "text-muted-foreground hover:text-foreground h-9 px-3.5",
      )}
      disabled={pending}
      onClick={handleClick}
    >
      <Download className="size-3.5" aria-hidden />
      {pending ? "Загрузка…" : "Скачать отчёт"}
    </Button>
  );
}
