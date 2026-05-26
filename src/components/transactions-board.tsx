"use client";

import { useState } from "react";

import { EditTransactionDialog } from "@/components/transaction-form-dialog";
import { TransactionList } from "@/components/transaction-list";
import type { Transaction, TransactionType } from "@/lib/types";

type Props = {
  transactions: Transaction[];
  typeFilter?: TransactionType | null;
};

export function TransactionsBoard({ transactions, typeFilter = null }: Props) {
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  return (
    <>
      <TransactionList
        transactions={transactions}
        typeFilter={typeFilter}
        onRowClick={(t) => {
          if (t.type !== "transfer") setEditTarget(t);
        }}
      />
      <EditTransactionDialog transaction={editTarget} onClose={() => setEditTarget(null)} />
    </>
  );
}
