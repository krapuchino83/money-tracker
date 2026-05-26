import { createClient } from "@/lib/supabase/server";
import { listAllAuthUsersForAdmin } from "@/lib/auth/list-admin-users";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { users, error } = await listAllAuthUsersForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Пользователи</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Список учётных записей Supabase Auth. Нужен{" "}
          <code className="rounded bg-muted px-1">SUPABASE_SERVICE_ROLE_KEY</code> в{" "}
          <code className="rounded bg-muted px-1">.env.local</code>.
        </p>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {user?.id ? (
        <AdminUsersTable users={users} currentUserId={user.id} />
      ) : null}
    </div>
  );
}
