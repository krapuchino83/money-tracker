"use client";

import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

/** Cookie: куда редирект после OAuth (сервер читает в /auth/callback). Без query в redirectTo Supabase — проще попасть в allow list. */
const OAUTH_NEXT_COOKIE = "mt_oauth_next";

type Provider = "google" | "github";

type Props = {
  /** Куда редирект после callback (pathname). */
  redirectTo: string;
};

function rememberPostAuthPath(path: string) {
  const safe = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  document.cookie = `${OAUTH_NEXT_COOKIE}=${encodeURIComponent(safe)}; Path=/; Max-Age=600; SameSite=Lax`;
}

export function SocialButtons({ redirectTo }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function oauth(provider: Provider) {
    setError(null);
    startTransition(async () => {
      rememberPostAuthPath(redirectTo);
      const supabase = createClient();
      const origin = window.location.origin;
      /**
       * redirectTo должен быть в Supabase → Authentication → Redirect URLs
       * (локально и прод: `https://…lovable.app/auth/callback`, `http://localhost:3000/auth/callback`,
       * или wildcard `https://…lovable.app/**`). Query на callback ломает allow list — не добавляем.
       */
      const { error: oErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (oErr) {
        setError(oErr.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => oauth("google")}
      >
        Войти через Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => oauth("github")}
      >
        Войти через GitHub
      </Button>
    </div>
  );
}
