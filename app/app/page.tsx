"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe2,
  MousePointerClick,
  RadioTower,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { getUncoveredCampaignPhases } from "@/lib/campaign-phases";
import { formatStatus } from "@/lib/workspace-model";

export default function DashboardPage() {
  const { state, hydrated, persistence } = useWorkspace();
  const usesSupabase = persistence === "supabase";
  const event = state.events[0];
  const campaign = state.campaigns.find((item) => item.eventId === event?.id);
  const latestSales = [...state.salesSnapshots]
    .filter((snapshot) => snapshot.eventId === event?.id)
    .sort((a, b) => b.importedAt.localeCompare(a.importedAt))[0];
  const upcomingTasks = [...state.publishingTasks]
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 4);
  const approvedCount = state.content.filter((item) =>
    ["approved", "scheduled", "published"].includes(item.status),
  ).length;
  const uncoveredPhases = getUncoveredCampaignPhases(state);

  const metrics = [
    {
      label: "Eventos activos",
      value: String(state.events.filter((item) => item.saleStatus !== "finished").length),
      detail: usesSupabase ? "Datos del espacio compartido" : "Datos del espacio local",
    },
    {
      label: "Campañas activas",
      value: String(
        state.campaigns.filter((item) => ["planned", "active"].includes(item.status))
          .length,
      ),
      detail: usesSupabase ? "Persistencia en Supabase" : "Pendientes de backend",
    },
    {
      label: "Piezas aprobadas",
      value: String(approvedCount),
      detail: `${state.content.length} piezas registradas`,
    },
    {
      label: "Próximas publicaciones",
      value: String(upcomingTasks.length),
      detail: "Publicación manual",
    },
  ];

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">
            Espacio de trabajo · {usesSupabase ? "Supabase" : "persistencia local"}
          </p>
          <h1>Panel de campañas y eventos</h1>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Ver alertas" title="Ver alertas">
            <AlertTriangle size={18} />
          </button>
          <Link className="primary-action" href="/app/eventos/nuevo">
            <CalendarDays size={18} />
            Nuevo evento
          </Link>
        </div>
      </header>

      {!hydrated ? (
        <p className="eyebrow">Recuperando espacio de trabajo…</p>
      ) : null}

      {event ? (
        <section className="hero-band">
          <div className="event-summary">
            <div className="status-row">
              <span className="pill green">{formatStatus(event.saleStatus)}</span>
              <span className="pill amber">Accred apagado</span>
              <span className="pill blue">{formatStatus(event.websiteStatus)}</span>
            </div>
            <h2>{event.name}</h2>
            <p>
              {new Intl.DateTimeFormat("es-AR", {
                dateStyle: "full",
                timeStyle: "short",
                hour12: false,
              }).format(new Date(event.startsAt))}{" "}
              · {event.venueName}
            </p>
            <div className="event-actions">
              <Link className="secondary-action" href={`/${event.slug}`}>
                <Globe2 size={17} />
                Vista web
              </Link>
              <Link className="secondary-action" href="/app/calendario">
                <RadioTower size={17} />
                Calendario
              </Link>
              {event.externalTicketUrl ? (
                <a
                  className="secondary-action"
                  href={event.externalTicketUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Ticket size={17} />
                  Entradaweb
                </a>
              ) : null}
            </div>
          </div>
          <div className="concept-panel">
            <span>Concepto creativo</span>
            <strong>{campaign?.creativeConcept ?? "Sin campaña activa"}</strong>
            <p>{campaign?.objective ?? "Creá una campaña para definir el objetivo."}</p>
          </div>
        </section>
      ) : null}

      <section className="metric-grid" aria-label="Métricas principales">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      {uncoveredPhases.length > 0 ? (
        <section className="coverage-alert" aria-label="Cobertura de campaña">
          <AlertTriangle aria-hidden="true" size={22} />
          <div>
            <strong>
              {uncoveredPhases.length} fases sin publicaciones previstas
            </strong>
            <span>{uncoveredPhases.map((phase) => phase.name).join(" · ")}</span>
          </div>
          <Link href="/app/campanas">Revisar fases</Link>
        </section>
      ) : null}

      <section className="content-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Calendario</p>
              <h3>Próximas publicaciones</h3>
            </div>
            <Link className="text-action" href="/app/calendario">
              Ver calendario
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="timeline">
            {upcomingTasks.map((task) => {
              const content = state.content.find((item) => item.id === task.contentId);
              return (
                <div className="timeline-row" key={task.id}>
                  <time>
                    {new Intl.DateTimeFormat("es-AR", {
                      day: "2-digit",
                      month: "short",
                    }).format(new Date(task.scheduledAt))}
                  </time>
                  <div>
                    <strong>{content?.title ?? "Pieza sin título"}</strong>
                    <span>{formatStatus(task.channel)}</span>
                  </div>
                  <span className="state">{formatStatus(task.status)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Aprobación</p>
              <h3>Estado de contenido</h3>
            </div>
            <BadgeCheck size={20} className="muted-icon" />
          </div>
          <div className="module-list">
            {state.content.map((item) => (
              <div className="module-row" key={item.id}>
                {item.status === "approved" || item.status === "scheduled" ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <Clock3 size={17} />
                )}
                <span>
                  {item.title}: {formatStatus(item.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Trazabilidad</p>
              <h3>Actividad reciente</h3>
            </div>
          </div>
          <div className="alert-list">
            {state.activity.slice(0, 5).map((entry) => (
              <div className="alert-row" key={entry.id}>
                <AlertTriangle size={17} />
                <span>
                  <strong>{entry.actor}:</strong> {entry.summary}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Embudo</p>
              <h3>Campaña a venta</h3>
            </div>
            <MousePointerClick size={20} className="muted-icon" />
          </div>
          <div className="funnel">
            <div>
              <span>Visitas</span>
              <strong>Pendiente GA4</strong>
            </div>
            <div>
              <span>Inicios de compra</span>
              <strong>Pendiente Pixel</strong>
            </div>
            <div>
              <span>Ventas</span>
              <strong>
                {latestSales
                  ? `${latestSales.totalTickets} entradas`
                  : "EntradaWeb"}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
