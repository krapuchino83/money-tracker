import Link from "next/link";

import { signOut } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { isAdminEmail } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function UserMenu() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center justify-end gap-2 text-sm">
      {isAdminEmail(user.email) ? (
        <Link
          href="/admin/users"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          Админ
        </Link>
      ) : null}
      <span className="text-muted-foreground hidden max-w-[10rem] truncate sm:inline" title={user.email ?? undefined}>
        {user.email}
      </span>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm">
          Выйти
        </Button>
      </form>
    </div>
  );
}
