"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function setPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 12) {
    redirect("/set-password?error=length");
  }
  if (password !== confirmation) {
    redirect("/set-password?error=mismatch");
  }

  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login?error=invite");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect("/set-password?error=update");
  }

  redirect("/app");
}
