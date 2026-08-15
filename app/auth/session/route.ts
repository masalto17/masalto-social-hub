import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const accessToken =
    typeof body === "object" && body && "accessToken" in body
      ? String(body.accessToken)
      : "";
  const refreshToken =
    typeof body === "object" && body && "refreshToken" in body
      ? String(body.refreshToken)
      : "";

  if (
    !accessToken ||
    !refreshToken ||
    accessToken.length > 8192 ||
    refreshToken.length > 8192
  ) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  }

  return new NextResponse(null, { status: 204 });
}
