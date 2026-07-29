import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";

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
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
