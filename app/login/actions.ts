"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAuthMode } from "@/lib/supabase/auth-mode";
import {
  createOwnerSession,
  hasMatchingOwnerAccessSecret,
  OWNER_SESSION_COOKIE,
  ownerSessionMaxAge,
} from "@/lib/owner-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const authMode = getAuthMode();

  if (authMode === "owner") {
    const accessKey = String(formData.get("accessKey") ?? "");
    const secret = process.env.OWNER_ACCESS_SECRET?.trim() ?? "";

    if (!accessKey) {
      redirect("/login?error=missing");
    }

    if (!hasMatchingOwnerAccessSecret(accessKey, secret)) {
      redirect("/login?error=invalid");
    }

    const cookieStore = await cookies();
    cookieStore.set(OWNER_SESSION_COOKIE, await createOwnerSession(secret), {
      httpOnly: true,
      maxAge: ownerSessionMaxAge(),
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    redirect("/app");
  }

  if (authMode !== "configured") {
    redirect("/access-required");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=invalid");
  }

  redirect("/app");
}
