import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, LayoutDashboard, MapPin } from "lucide-react";
import { demoWorkspace } from "@/lib/demo-workspace";
import { formatStatus } from "@/lib/workspace-model";
import styles from "./catalog.module.css";

export const metadata: Metadata = {
  title: "Próximos eventos | MasAlto Producciones",
  description: "Agenda oficial de eventos y producciones de MasAlto en San Juan.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Próximos eventos | MasAlto Producciones",
    description: "Agenda oficial de eventos y producciones de MasAlto en San Juan.",
    type: "website",
    locale: "es_AR",
    url: "https://eventos.masalto.com.ar",
  },
};

const publicEvents = demoWorkspace.events.filter(
  (event) => event.websiteStatus !== "hidden" && event.websiteStatus !== "archived",
);

export default function PublicCatalogPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <Image
            src="/brand/masalto-producciones.trimmed.png"
            alt="MásAlto Producciones"
            width={190}
            height={92}
            priority
          />
        </Link>
        <Link className={styles.dashboardLink} href="/app">
          <LayoutDashboard aria-hidden="true" size={18} />
          Panel
        </Link>
      </header>

      <section className={styles.intro}>
        <p>Agenda oficial</p>
        <h1>Próximos eventos</h1>
        <span>Información, novedades y entradas desde una única página oficial.</span>
      </section>

      <section className={styles.events} aria-label="Eventos publicados">
        {publicEvents.map((event) => (
          <article className={styles.event} key={event.id}>
            <Link className={styles.poster} href={`/${event.slug}`}>
              <Image
                src="/events/sabroso-2026/flyer.webp"
                alt={`Flyer de ${event.name}`}
                fill
                loading="eager"
                sizes="(max-width: 720px) 100vw, 420px"
              />
            </Link>

            <div className={styles.eventBody}>
              <span className={styles.status}>{formatStatus(event.saleStatus)}</span>
              <h2>{event.name}</h2>
              <div className={styles.facts}>
                <span>
                  <CalendarDays aria-hidden="true" size={18} />
                  {new Intl.DateTimeFormat("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(event.startsAt))}
                </span>
                <span>
                  <Clock3 aria-hidden="true" size={18} />
                  {new Intl.DateTimeFormat("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(event.startsAt))}{" "}
                  h
                </span>
                <span>
                  <MapPin aria-hidden="true" size={18} />
                  {event.venueName} · {event.city}
                </span>
              </div>
              <Link className={styles.eventCta} href={`/${event.slug}`}>
                Ver evento
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <footer className={styles.footer}>
        <span>MasAlto Producciones · San Juan</span>
        <Link href="/privacidad">Privacidad</Link>
      </footer>
    </main>
  );
}
