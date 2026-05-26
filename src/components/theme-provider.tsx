"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyThemeToDocument,
  getNextTheme,
  normalizeStoredTheme,
  readStoredTheme,
  resolveInitialTheme,
  type ThemeId,
  writeStoredTheme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readThemeFromDom(): ThemeId | null {
  if (typeof document === "undefined") return null;
  const attr = document.documentElement.getAttribute("data-theme");
  return normalizeStoredTheme(attr);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("light");

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    writeStoredTheme(t);
    applyThemeToDocument(t);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = getNextTheme(prev);
      writeStoredTheme(next);
      applyThemeToDocument(next);
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    const fromDom = readThemeFromDom();
    const fromStorage = readStoredTheme();
    const next = fromDom ?? fromStorage ?? resolveInitialTheme();
    setThemeState(next);
    applyThemeToDocument(next);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, cycleTheme }),
    [theme, setTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
