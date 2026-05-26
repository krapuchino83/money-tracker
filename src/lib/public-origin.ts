import type { NextRequest } from "next/server";

/**
 * Публичный origin за reverse-proxy (Vercel, Lovable и т.д.), иначе редиректы после OAuth
 * могут уйти на `http://` или неверный host — сессия «теряется».
 */
export function getRequestPublicOrigin(request: NextRequest): string {
  const rawHost =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    request.nextUrl.host;

  const rawProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "";

  const isLocal =
    rawHost.startsWith("localhost") ||
    rawHost.startsWith("127.") ||
    rawHost === "[::1]";

  let proto = rawProto || "";

  if (!proto) {
    if (isLocal) {
      proto = request.nextUrl.protocol.replace(":", "") === "http" ? "http" : "https";
    } else {
      // Прод за прокси без x-forwarded-proto — почти всегда HTTPS.
      proto = "https";
    }
  }

  if (proto !== "http" && proto !== "https") {
    proto = isLocal ? "http" : "https";
  }

  return `${proto}://${rawHost}`;
}
