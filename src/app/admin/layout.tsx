import Link from "next/link";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { isAdminEmail } from "@/lib/auth/admin";
import { ensureAdminProfileRole } from "@/lib/auth/sync-admin-profile";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin/users");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/");
  }

  await ensureAdminProfileRole(user.id, user.email).catch(() => {});

  return (
    <div className="min-h-screen">
      <header className="glass-bar sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-muted-foreground text-[10px] font-medium tracking-[0.18em] uppercase">
              Панель
            </p>
            <span className="font-display text-lg tracking-tight">Администрирование</span>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin/users"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}
            >
              Пользователи
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
            >
              В приложение
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">{children}</div>
    </div>
  );
}
