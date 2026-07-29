import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe2,
  Inbox,
  Megaphone,
  MousePointerClick,
  RadioTower,
  Sparkles,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSabrosoTicketUrl } from "@/lib/sabroso-event";

const navItems = [
  { label: "Dashboard", icon: Activity, active: true },
  { label: "Eventos", icon: CalendarDays },
  { label: "Campanas", icon: Megaphone },
  { label: "Contenido", icon: Sparkles },
  { label: "Calendario", icon: Clock3 },
  { label: "Inbox", icon: Inbox },
  { label: "Web", icon: Globe2 },
];

const metrics = [
  { label: "Campanas activas", value: "4", detail: "2 con publicacion web" },
  { label: "Leads captados", value: "386", detail: "Instagram y Facebook" },
  { label: "Clicks a compra", value: "1.248", detail: "UTM activos" },
  { label: "Consultas abiertas", value: "17", detail: "5 requieren operador" },
];

const channels = [
  { name: "Instagram", status: "Programado", count: 8 },
  { name: "Facebook", status: "Programado", count: 6 },
  { name: "TikTok", status: "Borrador", count: 4 },
  { name: "WhatsApp", status: "Aprobacion", count: 3 },
  { name: "MasAlto.com.ar", status: "Programado", count: 1 },
];

const contentPlan = [
  {
    date: "31 Jul",
    title: "Anuncio oficial",
    channel: "Instagram + Facebook",
    state: "Aprobado",
  },
  {
    date: "04 Ago",
    title: "Reel clásicos",
    channel: "TikTok + Reels",
    state: "En revision",
  },
  {
    date: "08 Ago",
    title: "Sorteo entradas",
    channel: "Instagram",
    state: "Borrador",
  },
  {
    date: "14 Ago",
    title: "Spot radio",
    channel: "Radio + Stories",
    state: "Pendiente",
  },
];

const alerts = [
  "Accred esta desactivado para el piloto Sabroso.",
  "Flyer oficial incorporado; faltan las piezas adaptadas para redes.",
  "Entradaweb usa el perfil del productor hasta recibir el enlace directo.",
];

export default function Home() {
  const ticketUrl = getSabrosoTicketUrl();

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Navegacion principal">
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
            return (
              <button className={item.active ? "nav-item active" : "nav-item"} key={item.label}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Prototipo local · datos mock</p>
            <h1>Panel de campanas y eventos</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Ver alertas" title="Ver alertas">
              <AlertTriangle size={18} />
            </button>
            <button className="primary-action">
              <CalendarDays size={18} />
              Nuevo evento
            </button>
          </div>
        </header>

        <section className="hero-band">
          <div className="event-summary">
            <div className="status-row">
              <span className="pill green">Piloto real</span>
              <span className="pill amber">Accred apagado</span>
              <span className="pill blue">Landing local</span>
            </div>
            <h2>Sabroso en San Juan</h2>
            <p>Viernes 28 de agosto de 2026 · 23 h · Hugo Espectáculos</p>
            <div className="event-actions">
              <Link className="secondary-action" href="/sabroso-san-juan-2026">
                <Globe2 size={17} />
                Vista web
              </Link>
              <button className="secondary-action">
                <RadioTower size={17} />
                Automatizaciones
              </button>
              <a
                className="secondary-action"
                href={ticketUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Ticket size={17} />
                Entradaweb
              </a>
            </div>
          </div>
          <div className="concept-panel">
            <span>Concepto creativo</span>
            <strong>Del lado correcto de la noche</strong>
            <p>Todos los clásicos. Las nuevas canciones. El show completo.</p>
          </div>
        </section>

        <section className="metric-grid" aria-label="Metricas principales">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel large-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Calendario</p>
                <h3>Proximas publicaciones</h3>
              </div>
              <button className="text-action">
                Ver calendario
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="timeline">
              {contentPlan.map((item) => (
                <div className="timeline-row" key={`${item.date}-${item.title}`}>
                  <time>{item.date}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.channel}</span>
                  </div>
                  <span className="state">{item.state}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Canales</p>
                <h3>Distribucion</h3>
              </div>
            </div>
            <div className="channel-list">
              {channels.map((channel) => (
                <div className="channel-row" key={channel.name}>
                  <div>
                    <strong>{channel.name}</strong>
                    <span>{channel.status}</span>
                  </div>
                  <b>{channel.count}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Integracion</p>
                <h3>Accred por evento</h3>
              </div>
              <BadgeCheck size={20} className="muted-icon" />
            </div>
            <div className="module-list">
              {["Feature flag preparado", "Contrato futuro", "Sin conexion real"].map((module) => (
                <div className="module-row" key={module}>
                  <CheckCircle2 size={17} />
                  <span>{module}</span>
                </div>
              ))}
              <div className="module-row disabled">
                <Clock3 size={17} />
                <span>Activacion post-Sabroso</span>
              </div>
            </div>
          </div>

          <div className="panel large-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Alertas</p>
                <h3>Acciones requeridas</h3>
              </div>
            </div>
            <div className="alert-list">
              {alerts.map((alert) => (
                <div className="alert-row" key={alert}>
                  <AlertTriangle size={17} />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Embudo</p>
                <h3>Campana a venta</h3>
              </div>
              <MousePointerClick size={20} className="muted-icon" />
            </div>
            <div className="funnel">
              <div>
                <span>Alcance</span>
                <strong>42.300</strong>
              </div>
              <div>
                <span>Interacciones</span>
                <strong>3.980</strong>
              </div>
              <div>
                <span>Leads</span>
                <strong>386</strong>
              </div>
              <div>
                <span>Ventas informadas</span>
                <strong>Mock</strong>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
