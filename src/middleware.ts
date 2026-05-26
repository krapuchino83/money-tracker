import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    return NextResponse.next({ request });
  }

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isCallback = pathname.startsWith("/auth/callback");
  const isApi = pathname.startsWith("/api");

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isCallback) {
    return response;
  }

  if (isApi) {
    return response;
  }

  if (!user && isAuthPage) {
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const dest = `${pathname}${request.nextUrl.search}`;
    if (dest !== "/") {
      url.searchParams.set("redirectTo", dest);
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
