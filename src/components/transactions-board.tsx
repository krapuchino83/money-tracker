"use client";

import { useState } from "react";

import { EditTransactionDialog } from "@/components/transaction-form-dialog";
import { TransactionList } from "@/components/transaction-list";
import type { Transaction } from "@/lib/types";

type Props = {
  transactions: Transaction[];
};

export function TransactionsBoard({ transactions }: Props) {
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  return (
    <>
      <TransactionList transactions={transactions} onRowClick={setEditTarget} />
      <EditTransactionDialog transaction={editTarget} onClose={() => setEditTarget(null)} />
    </>
  );
}
