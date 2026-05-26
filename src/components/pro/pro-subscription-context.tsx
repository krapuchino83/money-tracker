"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { ProSubscriptionDialog } from "@/components/pro/pro-subscription-dialog";

type ProSubscriptionContextValue = {
  isPro: boolean;
  stripeEnabled: boolean;
  openPaywall: () => void;
};

const ProSubscriptionContext = createContext<ProSubscriptionContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  isPro: boolean;
  stripeEnabled: boolean;
};

export function ProSubscriptionProvider({
  children,
  isPro,
  stripeEnabled,
}: ProviderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openPaywall = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const value = useMemo(
    () => ({ isPro, stripeEnabled, openPaywall }),
    [isPro, stripeEnabled, openPaywall],
  );

  return (
    <ProSubscriptionContext.Provider value={value}>
      {children}
      <ProSubscriptionDialog ref={dialogRef} isPro={isPro} stripeEnabled={stripeEnabled} />
    </ProSubscriptionContext.Provider>
  );
}

export function useProSubscription(): ProSubscriptionContextValue {
  const ctx = useContext(ProSubscriptionContext);
  if (!ctx) {
    throw new Error("useProSubscription must be used within ProSubscriptionProvider");
  }
  return ctx;
}
