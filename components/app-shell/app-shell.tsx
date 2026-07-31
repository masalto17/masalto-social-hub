"use client";

import {
  Activity,
  CalendarDays,
  FileImage,
  Globe2,
  Inbox,
  LogOut,
  Megaphone,
  ReceiptText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app", label: "Dashboard", icon: Activity },
  { href: "/app/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/app/campanas", label: "Campañas", icon: Megaphone },
  { href: "/app/contenido", label: "Contenido", icon: FileImage },
  { href: "/app/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/app/ventas", label: "Ventas", icon: ReceiptText },
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/", label: "Web pública", icon: Globe2 },
];

export function AppShell({
  authConfigured,
  children,
}: {
  authConfigured: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand">
          <div className="brand-logo-shell">
            <Image
              src="/brand/masalto-producciones.trimmed.png"
              alt="MásAlto Producciones"
              width={180}
              height={92}
              priority
            />
          </div>
          <span>Social Hub</span>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                className={active ? "nav-item active" : "nav-item"}
                href={item.href}
                key={item.href}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {authConfigured ? (
          <form className="logout-form" action="/logout" method="post">
            <button className="nav-item" type="submit">
              <LogOut size={18} aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        ) : null}
      </aside>

      <section className="workspace">{children}</section>
    </main>
  );
}
