"use client";

import { CalendarClock, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { formatStatus } from "@/lib/workspace-model";
import styles from "../workspace.module.css";

function addDay(value: string) {
  const date = new Date(value);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

export default function CalendarPage() {
  const { state, moveTask } = useWorkspace();
  const tasks = [...state.publishingTasks].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  );

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Programación</p>
          <h1>Calendario editorial</h1>
        </div>
      </header>

      <p className={styles.notice}>
        Vista operativa semanal del prototipo. Mover una fecha registra la acción, pero
        no modifica publicaciones en redes externas.
      </p>

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
