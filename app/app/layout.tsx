import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { getAuthMode } from "@/lib/supabase/auth-mode";

export const metadata: Metadata = {
  title: {
    default: "Panel | MasAlto Social Hub",
    template: "%s | MasAlto Social Hub",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function InternalAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authConfigured = getAuthMode() === "configured";

  return (
    <WorkspaceProvider>
      <AppShell authConfigured={authConfigured}>{children}</AppShell>
    </WorkspaceProvider>
  );
}
