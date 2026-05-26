import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getRequestPublicOrigin } from "@/lib/public-origin";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const OAUTH_NEXT_COOKIE = "mt_oauth_next";

function safePath(raw: string | null): string | null {
  if (!raw?.trim()) {
    return null;
  }
  const t = raw.trim();
  return t.startsWith("/") && !t.startsWith("//") ? t : null;
}

/**
 * OAuth / email link: обмен code → сессия.
 * Cookie сессии пишем в тот же NextResponse, что и редирект.
 */
export async function GET(request: NextRequest) {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseAnonKey();

  const searchParams = request.nextUrl.searchParams;
  const origin = getRequestPublicOrigin(request);
  const code = searchParams.get("code");

  const nextFromQuery = safePath(searchParams.get("next"));
  const nextFromCookie = (() => {
    const c = request.cookies.get(OAUTH_NEXT_COOKIE)?.value;
    if (!c) {
      return null;
    }
    try {
      return safePath(decodeURIComponent(c));
    } catch {
      return null;
    }
  })();

  const safeNext = nextFromQuery ?? nextFromCookie ?? "/";

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Нет переменных Supabase"), origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  const redirectUrl = new URL(safeNext, origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(OAUTH_NEXT_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const err = NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent(error.message), origin),
    );
    err.cookies.set(OAUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 });
    return err;
  }

  return response;
}
