"use client";

import { Crown } from "lucide-react";

import { useProSubscription } from "@/components/pro/pro-subscription-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProHeaderButton() {
  const { isPro, openPaywall } = useProSubscription();

  return (
    <Button
      type="button"
      variant={isPro ? "secondary" : "outline"}
      size="sm"
      className={cn(
        "rounded-full gap-1.5",
        isPro && "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
      )}
      onClick={openPaywall}
    >
      <Crown className="size-3.5" aria-hidden />
      Pro
    </Button>
  );
}
