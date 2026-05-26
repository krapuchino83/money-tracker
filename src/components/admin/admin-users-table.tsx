"use client";

import { useTransition } from "react";

import { banUser, deleteUser, unbanUser } from "@/app/actions/adminUsers";
import { Button } from "@/components/ui/button";
import type { AdminUserRow } from "@/lib/types/admin-user";

type Props = {
  users: AdminUserRow[];
  currentUserId: string;
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  none: "—",
  active: "активна",
  trialing: "пробный",
  past_due: "просрочена оплата",
  canceled: "отменена",
  unpaid: "не оплачена",
  incomplete: "не завершена",
  incomplete_expired: "истекла",
  paused: "на паузе",
};

function formatPeriodEnd(iso: string | null): { text: string; expired: boolean } {
  if (!iso) {
    return { text: "—", expired: false };
  }

  const end = new Date(iso);
  const expired = end.getTime() <= Date.now();
  const text = end.toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return { text: expired ? `истекло ${text}` : text, expired };
}

export function AdminUsersTable({ users, currentUserId }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Регистрация</th>
            <th className="px-4 py-3 font-medium">PRO</th>
            <th className="px-4 py-3 font-medium">Действует до</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 font-medium text-end">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-muted-foreground px-4 py-8 text-center">
                Пользователей нет или список не загрузился.
              </td>
            </tr>
          ) : (
            users.map((u) => {
              const isSelf = u.id === currentUserId;
              const periodEnd = formatPeriodEnd(u.pro_current_period_end);
              const statusLabel =
                SUBSCRIPTION_STATUS_LABELS[u.subscription_status] ?? u.subscription_status;

              return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{u.email ?? "—"}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString("ru-RU", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.is_pro ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        PRO
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Нет</span>
                    )}
                    {!u.is_pro && u.subscription_status !== "none" ? (
                      <span className="text-muted-foreground mt-0.5 block text-xs">{statusLabel}</span>
                    ) : null}
                  </td>
                  <td
                    className={
                      periodEnd.expired
                        ? "text-destructive px-4 py-3 text-xs"
                        : "text-muted-foreground px-4 py-3 text-xs"
                    }
                  >
                    {periodEnd.text}
                  </td>
                  <td className="px-4 py-3">{u.banned ? "Заблокирован" : "Активен"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {isSelf ? (
                        <span className="text-muted-foreground text-xs">Это вы</span>
                      ) : (
                        <>
                          {u.banned ? (
                            <form
                              action={(fd) => {
                                startTransition(async () => {
                                  await unbanUser(fd);
                                });
                              }}
                            >
                              <input type="hidden" name="userId" value={u.id} />
                              <Button type="submit" variant="outline" size="sm" disabled={pending}>
                                Разблокировать
                              </Button>
                            </form>
                          ) : (
                            <form
                              action={(fd) => {
                                startTransition(async () => {
                                  await banUser(fd);
                                });
                              }}
                            >
                              <input type="hidden" name="userId" value={u.id} />
                              <Button type="submit" variant="outline" size="sm" disabled={pending}>
                                Заблокировать
                              </Button>
                            </form>
                          )}
                          <form
                            action={(fd) => {
                              if (!window.confirm("Удалить пользователя и связанные данные?")) {
                                return;
                              }
                              startTransition(async () => {
                                await deleteUser(fd);
                              });
                            }}
                          >
                            <input type="hidden" name="userId" value={u.id} />
                            <Button type="submit" variant="destructive" size="sm" disabled={pending}>
                              Удалить
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
