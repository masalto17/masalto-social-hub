import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getAuthMode,
  getSupabasePublicConfig,
} from "@/lib/supabase/auth-mode";
import { hasValidOwnerSession, OWNER_SESSION_COOKIE } from "@/lib/owner-session";

export async function proxy(request: NextRequest) {
  const authMode = getAuthMode();

  if (authMode === "prototype") {
    return NextResponse.next();
  }

  if (authMode === "owner") {
    const secret = process.env.OWNER_ACCESS_SECRET?.trim();
    const session = request.cookies.get(OWNER_SESSION_COOKIE)?.value;

    if (!secret || !(await hasValidOwnerSession(session, secret))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  if (authMode === "blocked") {
    return NextResponse.redirect(new URL("/access-required", request.url));
  }

  const config = getSupabasePublicConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/access-required", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*"],
};
