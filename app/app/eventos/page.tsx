"use client";

import { CalendarPlus, ExternalLink, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { formatStatus } from "@/lib/workspace-model";
import styles from "../workspace.module.css";

export default function EventsPage() {
  const { state, resetDemo } = useWorkspace();

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Operación</p>
          <h1>Eventos</h1>
        </div>
        <div className={styles.actions}>
          <button className={styles.buttonSecondary} type="button" onClick={resetDemo}>
            <RotateCcw aria-hidden="true" size={17} />
            Restaurar demo
          </button>
          <Link className={styles.button} href="/app/eventos/nuevo">
            <CalendarPlus aria-hidden="true" size={18} />
            Nuevo evento
          </Link>
        </div>
      </header>

      <p className={styles.notice}>
        Estos datos se guardan solamente en este navegador. Los eventos nuevos no se
        publican en la web oficial hasta conectar Supabase y aprobarlos.
      </p>

      <section className={styles.wideCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Agenda</p>
            <h2>{state.events.length} eventos registrados</h2>
          </div>
        </div>

        <div className={styles.list}>
          {state.events.map((event) => (
            <article className={styles.row} key={event.id}>
              <div className={styles.rowTitle}>
                <strong>{event.name}</strong>
                <span className={styles.muted}>
                  {event.venueName} · {event.city}
                </span>
              </div>
              <div>
                <strong>
                  {new Intl.DateTimeFormat("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(event.startsAt))}
                </strong>
                <div className={styles.muted}>
                  {new Intl.DateTimeFormat("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(event.startsAt))}{" "}
                  h
                </div>
              </div>
              <div>
                <span className={styles.badge}>{formatStatus(event.saleStatus)}</span>
                <div className={styles.muted}>{formatStatus(event.ecosystemMode)}</div>
              </div>
              {event.id === "event_sabroso_2026" ? (
                <Link
                  className={styles.iconButton}
                  href={`/${event.slug}`}
                  aria-label={`Ver página pública de ${event.name}`}
                  title="Ver página pública"
                >
                  <ExternalLink aria-hidden="true" size={18} />
                </Link>
              ) : (
                <span className={styles.muted}>Borrador local</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
