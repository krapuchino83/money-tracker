"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { addTransaction, updateTransaction } from "@/app/actions";
import { PaymentAmountFields } from "@/components/payment-amount-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentCurrency } from "@/lib/nbrb/types";
import type { Transaction } from "@/lib/types";
import { TRANSACTION_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  autoOpen?: boolean;
  /** Встроенная кнопка в панель журнала (фильтры + действия). */
  integrated?: boolean;
};

export function TransactionFormDialog({ autoOpen, integrated }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentCurrency, setPaymentCurrency] = useState<PaymentCurrency>("RUB");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(todayInputValue());

  useEffect(() => {
    if (autoOpen) {
      dialogRef.current?.showModal();
    }
  }, [autoOpen]);

  return (
    <>
      <Button
        type="button"
        size={integrated ? "sm" : "default"}
        className={cn(
          "rounded-full shadow-sm",
          integrated ? "h-9 px-4" : "px-5",
        )}
        onClick={() => dialogRef.current?.showModal()}
      >
        + Добавить
      </Button>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-[100] m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-border/60 bg-card/95 p-0 shadow-2xl ring-1 ring-foreground/[0.06] backdrop:bg-black/45 backdrop:backdrop-blur-[2px] open:flex open:flex-col"
      >
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="font-display text-lg tracking-tight">Новая транзакция</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Курс НБРБ запрашивается при сохранении; на счёт зачисляются ₽.
          </p>
        </div>
        <form
          ref={formRef}
          className="flex flex-col gap-4 p-5"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const res = await addTransaction(fd);
              if (res.ok) {
                formRef.current?.reset();
                setPaymentCurrency("RUB");
                setPaymentAmount("");
                setTransactionDate(todayInputValue());
                dialogRef.current?.close();
              } else {
                const msg =
                  typeof res.error === "string"
                    ? res.error
                    : JSON.stringify(res.error);
                setError(msg);
              }
            });
          }}
        >
          <div className="grid gap-2">
            <span className="text-sm font-medium">Тип</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="type" value="income" required defaultChecked />
                Доход
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="type" value="expense" required />
                Расход
              </label>
            </div>
          </div>

          <PaymentAmountFields
            paymentCurrency={paymentCurrency}
            onPaymentCurrencyChange={setPaymentCurrency}
            paymentAmount={paymentAmount}
            onPaymentAmountChange={setPaymentAmount}
            transactionDate={transactionDate}
          />

          <div className="grid gap-2">
            <Label htmlFor="category">Категория</Label>
            <select
              id="category"
              name="category"
              required
              className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue={TRANSACTION_CATEGORIES[0]}
            >
              {TRANSACTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Input id="description" name="description" maxLength={280} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Дата</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохранение…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

type EditProps = {
  transaction: Transaction | null;
  onClose: () => void;
};

export function EditTransactionDialog({ transaction, onClose }: EditProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentCurrency, setPaymentCurrency] = useState<PaymentCurrency>("RUB");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(todayInputValue());

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onDialogClose = () => onClose();
    el.addEventListener("close", onDialogClose);
    return () => el.removeEventListener("close", onDialogClose);
  }, [onClose]);

  useEffect(() => {
    if (transaction) {
      setPaymentCurrency(transaction.payment_currency);
      setPaymentAmount(String(transaction.payment_amount));
      setTransactionDate(transaction.date);
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [transaction]);

  if (!transaction) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[100] m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-border/60 bg-card/95 p-0 shadow-2xl ring-1 ring-foreground/[0.06] backdrop:bg-black/45 backdrop:backdrop-blur-[2px] open:flex open:flex-col"
    >
      <div className="border-b border-border/60 px-5 py-4">
        <h2 className="font-display text-lg tracking-tight">Редактирование</h2>
      </div>
      <form
        key={transaction.id}
        ref={formRef}
        className="flex flex-col gap-4 p-5"
        action={(fd) => {
          setError(null);
          startTransition(async () => {
            const res = await updateTransaction(fd);
            if (res.ok) {
              dialogRef.current?.close();
            } else {
              const msg =
                typeof res.error === "string"
                  ? res.error
                  : JSON.stringify(res.error);
              setError(msg);
            }
          });
        }}
      >
        <input type="hidden" name="id" value={transaction.id} />

        <div className="grid gap-2">
          <span className="text-sm font-medium">Тип</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                value="income"
                required
                defaultChecked={transaction.type === "income"}
              />
              Доход
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                value="expense"
                required
                defaultChecked={transaction.type === "expense"}
              />
              Расход
            </label>
          </div>
        </div>

        <PaymentAmountFields
          idPrefix="edit-"
          paymentCurrency={paymentCurrency}
          onPaymentCurrencyChange={setPaymentCurrency}
          paymentAmount={paymentAmount}
          onPaymentAmountChange={setPaymentAmount}
          transactionDate={transactionDate}
        />

        <div className="grid gap-2">
          <Label htmlFor="edit-category">Категория</Label>
          <select
            id="edit-category"
            name="category"
            required
            className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue={transaction.category}
          >
            {TRANSACTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-description">Описание (необязательно)</Label>
          <Input
            id="edit-description"
            name="description"
            maxLength={280}
            defaultValue={transaction.description ?? ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-date">Дата</Label>
          <Input
            id="edit-date"
            name="date"
            type="date"
            required
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => dialogRef.current?.close()}
            disabled={pending}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
