import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

type Props = {
  searchParams?: Promise<{ redirectTo?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const redirectTo =
    sp.redirectTo && sp.redirectTo.startsWith("/") && !sp.redirectTo.startsWith("//")
      ? sp.redirectTo
      : "/";

  return (
    <LoginForm redirectTo={redirectTo} urlError={sp.error} />
  );
}
