"use server";

import { cookies } from "next/headers";
import { getAuthMode } from "@/lib/supabase/auth-mode";
import { hasValidOwnerSession, OWNER_SESSION_COOKIE } from "@/lib/owner-session";

type ContentOperation = "approve" | "schedule";

type ContentOperationAuthorization =
  | { authorized: true; actor: "Hugo" | "Administrador local"; authorizedAt: string }
  | { authorized: false };

export async function authorizeContentOperation(
  operation: ContentOperation,
  contentId: string,
): Promise<ContentOperationAuthorization> {
  if (!contentId.trim() || !["approve", "schedule"].includes(operation)) {
    return { authorized: false };
  }

  const authMode = getAuthMode();
  if (authMode === "prototype") {
    return { authorized: true, actor: "Administrador local", authorizedAt: new Date().toISOString() };
  }

  if (authMode !== "owner") return { authorized: false };

  const secret = process.env.OWNER_ACCESS_SECRET?.trim() ?? "";
  const cookieStore = await cookies();
  const session = cookieStore.get(OWNER_SESSION_COOKIE)?.value;

  if (!(await hasValidOwnerSession(session, secret))) return { authorized: false };

  return { authorized: true, actor: "Hugo", authorizedAt: new Date().toISOString() };
}
