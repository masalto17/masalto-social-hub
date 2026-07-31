"use client";

import { CalendarClock, ChevronRight, Download } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  buildPublicationCsv,
  publicationExportFilename,
} from "@/lib/publication-export";
import { formatStatus } from "@/lib/workspace-model";
import styles from "../workspace.module.css";

function addDay(value: string) {
  const date = new Date(value);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

export default function CalendarPage() {
  const { state, moveTask } = useWorkspace();
  const [message, setMessage] = useState("");
  const tasks = [...state.publishingTasks].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  );

  const exportPlan = () => {
    const blob = new Blob([buildPublicationCsv(state)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = publicationExportFilename();
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Plan editorial exportado. La descarga no publica contenido.");
  };

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Programación</p>
          <h1>Calendario editorial</h1>
        </div>
        <button
          className={styles.button}
          type="button"
          onClick={exportPlan}
          disabled={tasks.length === 0}
        >
          <Download aria-hidden="true" size={18} />
          Exportar CSV
        </button>
      </header>

      <p className={styles.notice}>
        Vista operativa semanal del prototipo. Mover una fecha registra la acción, pero
        no modifica publicaciones en redes externas.
      </p>
      {message ? <p className={styles.notice}>{message}</p> : null}

      <section className={styles.wideCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Próximas piezas</p>
            <h2>{tasks.length} tareas de publicación</h2>
          </div>
          <CalendarClock aria-hidden="true" size={22} />
        </div>

        <div className={styles.timeline}>
          {tasks.map((task) => {
            const content = state.content.find((item) => item.id === task.contentId);
            const campaign = state.campaigns.find(
              (item) => item.id === content?.campaignId,
            );
            return (
              <article
                className={styles.timelineItem}
                data-task-id={task.id}
                key={task.id}
              >
                <time dateTime={task.scheduledAt}>
                  {new Intl.DateTimeFormat("es-AR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(task.scheduledAt))}
                </time>
                <div className={styles.rowTitle}>
                  <strong>{content?.title ?? "Pieza sin título"}</strong>
                  <span className={styles.muted}>{campaign?.name}</span>
                </div>
                <div>
                  <span className={styles.badge}>{formatStatus(task.channel)}</span>
                  <div className={styles.muted}>{formatStatus(task.status)}</div>
                </div>
                <button
                  className={styles.iconButton}
                  type="button"
                  onClick={() => moveTask(task.id, addDay(task.scheduledAt))}
                  aria-label={`Mover ${content?.title ?? "publicación"} un día`}
                  title="Mover un día"
                >
                  <ChevronRight aria-hidden="true" size={19} />
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
