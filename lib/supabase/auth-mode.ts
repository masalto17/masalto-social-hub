export type AuthMode = "prototype" | "configured" | "blocked";

type AuthEnvironment = {
  [key: string]: string | undefined;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  VERCEL_ENV?: string;
};

export function getAuthMode(environment: AuthEnvironment = process.env): AuthMode {
  const configured = Boolean(
    environment.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );

  if (configured) return "configured";
  return environment.VERCEL_ENV === "production" ? "blocked" : "prototype";
}

export function getSupabasePublicConfig(
  environment: AuthEnvironment = process.env,
) {
  if (getAuthMode(environment) !== "configured") return null;

  return {
    url: environment.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    publishableKey:
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!.trim(),
  };
}
