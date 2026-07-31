"use client";

import { BadgeCheck, CalendarClock, FileImage, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { formatStatus } from "@/lib/workspace-model";
import styles from "../workspace.module.css";

export default function ContentPage() {
  const { state, approveContent, scheduleContent } = useWorkspace();
  const [message, setMessage] = useState<string | null>(null);

  const prepareSchedule = (contentId: string) => {
    const scheduled = scheduleContent(contentId);
    setMessage(
      scheduled
        ? "La pieza quedó lista para publicación manual."
        : "Primero debe aprobarse la pieza.",
    );
  };

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Biblioteca</p>
          <h1>Contenido y aprobaciones</h1>
        </div>
        <Link className={styles.button} href="/app/contenido/nuevo">
          <Plus aria-hidden="true" size={18} />
          Nueva pieza
        </Link>
      </header>

      <p className={styles.notice}>
        La IA podrá proponer variantes más adelante. Por ahora ninguna acción publica:
        aprobar y programar son estados internos con trazabilidad.
      </p>

      {message ? <p className={styles.notice}>{message}</p> : null}

      <section className={styles.wideCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Piezas</p>
            <h2>{state.content.length} contenidos registrados</h2>
          </div>
          <FileImage aria-hidden="true" size={22} />
        </div>

        <div className={styles.list}>
          {state.content.map((content) => {
            const campaign = state.campaigns.find(
              (item) => item.id === content.campaignId,
            );
            const hasTask = state.publishingTasks.some(
              (task) => task.contentId === content.id,
            );
            const approved = ["approved", "scheduled", "published"].includes(
              content.status,
            );

            return (
              <article className={styles.row} key={content.id}>
                <div className={styles.rowTitle}>
                  <strong>{content.title}</strong>
                  <span className={styles.muted}>{campaign?.name}</span>
                  <span className={styles.muted}>{content.format}</span>
                </div>
                <span
                  className={`${styles.badge} ${
                    approved ? styles.badgeApproved : styles.badgePending
                  }`}
                >
                  {formatStatus(content.status)}
                </span>
                <span className={styles.muted}>
                  {content.approvedBy
                    ? `Aprobó ${content.approvedBy}`
                    : "Sin aprobación"}
                </span>
                <div className={styles.actions}>
                  {!approved ? (
                    <button
                      className={styles.iconButton}
                      type="button"
                      onClick={() => approveContent(content.id)}
                      aria-label={`Aprobar ${content.title}`}
                      title="Aprobar pieza"
                    >
                      <BadgeCheck aria-hidden="true" size={19} />
                    </button>
                  ) : null}
                  {hasTask && content.status === "approved" ? (
                    <button
                      className={styles.iconButton}
                      type="button"
                      onClick={() => prepareSchedule(content.id)}
                      aria-label={`Preparar publicación de ${content.title}`}
                      title="Preparar publicación manual"
                    >
                      <CalendarClock aria-hidden="true" size={19} />
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
