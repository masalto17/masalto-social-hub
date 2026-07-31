import { NextResponse, type NextRequest } from "next/server";
import { getAuthMode } from "@/lib/supabase/auth-mode";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (getAuthMode() !== "configured") {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return new NextResponse("Origen no permitido.", { status: 403 });
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut({ scope: "local" });

  return NextResponse.redirect(new URL("/login", request.url), 303);
}
