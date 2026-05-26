"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="rounded-full border-border/60 shadow-sm"
      onClick={cycleTheme}
      aria-label={
        isLight
          ? "Включить тёмную тему"
          : "Включить светлую тему"
      }
      title={isLight ? "Тёмная тема" : "Светлая тема"}
    >
      {isLight ? (
        <Moon className="size-4" aria-hidden />
      ) : (
        <Sun className="size-4" aria-hidden />
      )}
    </Button>
  );
}
