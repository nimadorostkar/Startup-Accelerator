import { NextResponse, type NextRequest } from "next/server";
import { RETURN_TO_HEADER, SESSION_COOKIE, signInHref } from "@/lib/session";

/* Runs before the signed-in areas (/dashboard, /admin).

   - No session cookie at all: straight to sign-in, remembering the page, so a
     link from an email ("your application was reviewed") lands where it points
     once the visitor has signed in.
   - Otherwise the page is told its own path (RETURN_TO_HEADER), so if the
     session turns out to have ended, it can do the same.

   This is only a shortcut: every page and action still asks the API who the
   visitor is, and the API decides what they may see (lib/auth.ts). */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const here = pathname + search;

  // Form posts (Server Actions) answer for themselves; only page visits are redirected.
  if (!request.cookies.get(SESSION_COOKIE)?.value && request.method === "GET") {
    return NextResponse.redirect(new URL(signInHref(here), request.url));
  }

  const headers = new Headers(request.headers);
  headers.set(RETURN_TO_HEADER, here);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
