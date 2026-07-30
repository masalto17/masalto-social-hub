import { NextResponse, type NextRequest } from "next/server";
import { getAuthMode } from "@/lib/supabase/auth-mode";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OWNER_SESSION_COOKIE } from "@/lib/owner-session";

export async function POST(request: NextRequest) {
  const authMode = getAuthMode();
  if (authMode !== "configured" && authMode !== "owner") {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return new NextResponse("Origen no permitido.", { status: 403 });
  }

  if (authMode === "configured") {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut({ scope: "local" });
  }

  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(OWNER_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
