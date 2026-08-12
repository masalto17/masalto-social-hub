export type AuthMode = "prototype" | "owner" | "configured" | "blocked";

export type AuthEnvironment = {
  [key: string]: string | undefined;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  OWNER_ACCESS_SECRET?: string;
  ALLOW_PROTOTYPE_AUTH?: string;
  NODE_ENV?: string;
};

export function getAuthMode(environment: AuthEnvironment = process.env): AuthMode {
  const configured = Boolean(
    environment.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );

  if (configured) return "configured";
  if (environment.OWNER_ACCESS_SECRET?.trim()) return "owner";

  const explicitlyLocalPrototype =
    environment.ALLOW_PROTOTYPE_AUTH === "true" &&
    environment.NODE_ENV !== "production";

  return explicitlyLocalPrototype ? "prototype" : "blocked";
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
