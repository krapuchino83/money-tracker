"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { addTransaction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRANSACTION_CATEGORIES } from "@/lib/types";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  /** When true, dialog opens on mount (e.g. empty-state link `/?add=1`). */
  autoOpen?: boolean;
};

export function TransactionFormDialog({ autoOpen }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoOpen) {
      dialogRef.current?.showModal();
    }
  }, [autoOpen]);

  return (
    <>
      <Button type="button" onClick={() => dialogRef.current?.showModal()}>
        + Добавить
      </Button>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto w-[min(100%-2rem,28rem)] rounded-xl border border-border bg-background p-0 shadow-lg backdrop:bg-black/40 open:flex open:flex-col"
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">Новая транзакция</h2>
        </div>
        <form
          ref={formRef}
          className="flex flex-col gap-4 p-4"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const res = await addTransaction(fd);
              if (res.ok) {
                formRef.current?.reset();
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

          <div className="grid gap-2">
            <Label htmlFor="amount">Сумма</Label>
            <Input id="amount" name="amount" type="number" min={1} step="0.01" required />
          </div>

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
            <Input id="date" name="date" type="date" required defaultValue={todayInputValue()} />
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
