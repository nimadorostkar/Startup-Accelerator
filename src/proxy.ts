import { NextResponse, type NextRequest } from "next/server";
import { isUnlocalized } from "@/i18n/config";
import { RETURN_TO_HEADER, SESSION_COOKIE, signInHref } from "@/lib/session";

/* Runs before every page.

   The public site's languages: its pages live under app/[lang]. English is
   served at the bare paths (/events is rendered from /en/events), Turkish and
   Persian under their prefix (/tr/events, /fa/events); /en/… redirects to the
   bare path, so every English page has one address.

   The signed-in areas (/dashboard, /admin), English only:
   - No session cookie at all: straight to sign-in, remembering the page, so a
     link from an email ("your application was reviewed") lands where it points
     once the visitor has signed in.
   - Otherwise the page is told its own path (RETURN_TO_HEADER), so if the
     session turns out to have ended, it can do the same.
   That is only a shortcut: every page and action still asks the API who the
   visitor is, and the API decides what they may see (lib/auth.ts). */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (/^\/(dashboard|admin)(\/|$)/.test(pathname)) {
    const here = pathname + search;
    // Form posts (Server Actions) answer for themselves; only page visits are redirected.
    if (!request.cookies.get(SESSION_COOKIE)?.value && request.method === "GET") {
      return NextResponse.redirect(new URL(signInHref(here), request.url));
    }
    const headers = new Headers(request.headers);
    headers.set(RETURN_TO_HEADER, here);
    return NextResponse.next({ request: { headers } });
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return NextResponse.redirect(new URL((pathname.slice(3) || "/") + search, request.url), 308);
  }
  if (/^\/(tr|fa)(\/|$)/.test(pathname) || isUnlocalized(pathname)) return NextResponse.next();

  return NextResponse.rewrite(new URL(`/en${pathname === "/" ? "" : pathname}${search}`, request.url));
}

export const config = {
  // Not for Next's own files, the API's routes on this server, or files in public/.
  matcher: ["/((?!_next/|api/|images/|icon\\.svg|robots\\.txt|sitemap\\.xml).*)"],
};
