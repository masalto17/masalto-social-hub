export type EventEcosystemMode = "independent" | "accred";
export type WebsiteStatus =
  | "hidden"
  | "draft"
  | "scheduled"
  | "published"
  | "private_link"
  | "archived";
export type SaleStatus =
  | "coming_soon"
  | "presale"
  | "available"
  | "last_tickets"
  | "sold_out"
  | "rescheduled"
  | "cancelled"
  | "finished";
export type CampaignStatus =
  | "draft"
  | "planned"
  | "active"
  | "paused"
  | "finished"
  | "archived";
export type ContentStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "published"
  | "failed"
  | "archived";
export type SocialChannel =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "whatsapp"
  | "web";

export type EventRecord = {
  id: string;
  name: string;
  slug: string;
  startsAt: string;
  venueName: string;
  city: string;
  capacity: number | null;
  ecosystemMode: EventEcosystemMode;
  websiteStatus: WebsiteStatus;
  saleStatus: SaleStatus;
  ticketingProvider: "entradaweb" | "accred" | "external" | "physical" | "none";
  externalTicketUrl: string | null;
  accredEnabled: false;
  createdAt: string;
};

export type CampaignRecord = {
  id: string;
  eventId: string | null;
  name: string;
  objective: string;
  audience: string;
  creativeConcept: string;
  budgetAmount: number | null;
  budgetCurrency: "ARS";
  startsAt: string;
  endsAt: string;
  status: CampaignStatus;
  createdAt: string;
};

export type ContentRecord = {
  id: string;
  campaignId: string;
  title: string;
  baseCopy: string;
  format: string;
  status: ContentStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
};

export type PublishingTaskRecord = {
  id: string;
  contentId: string;
  channel: SocialChannel;
  copy: string;
  scheduledAt: string;
  status: ContentStatus;
  provider: "manual";
};

export type ActivityRecord = {
  id: string;
  entityType:
    | "event"
    | "campaign"
    | "content"
    | "publishing_task"
    | "sales_import";
  entityId: string;
  action: string;
  summary: string;
  actor: "Hugo" | "Sistema demo";
  createdAt: string;
};

export type SalesSnapshotRecord = {
  id: string;
  eventId: string;
  source: "entradaweb";
  buyerRows: number;
  totalTickets: number;
  rejectedRows: number;
  byDevice: Record<string, number>;
  byProvince: Record<string, number>;
  byLocality: Record<string, number>;
  importedAt: string;
};

export type WorkspaceState = {
  version: 3;
  events: EventRecord[];
  campaigns: CampaignRecord[];
  content: ContentRecord[];
  publishingTasks: PublishingTaskRecord[];
  salesSnapshots: SalesSnapshotRecord[];
  activity: ActivityRecord[];
};

export type NewEventInput = Omit<
  EventRecord,
  "id" | "slug" | "accredEnabled" | "createdAt"
>;
export type NewCampaignInput = Omit<CampaignRecord, "id" | "createdAt">;
export type NewContentInput = Omit<
  ContentRecord,
  "id" | "approvedBy" | "approvedAt" | "createdAt"
> & {
  channels: SocialChannel[];
  channelCopies: Partial<Record<SocialChannel, string>>;
  scheduledAt: string;
};
export type NewSalesSnapshotInput = Omit<
  SalesSnapshotRecord,
  "id" | "source" | "importedAt"
>;

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(value: string, existingSlugs: string[]) {
  const base = slugify(value) || "evento";
  const occupied = new Set(existingSlugs);
  if (!occupied.has(base)) return base;

  let suffix = 2;
  while (occupied.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function formatStatus(value: string) {
  const labels: Record<string, string> = {
    independent: "Independiente",
    accred: "Accred configurado",
    hidden: "Oculto",
    draft: "Borrador",
    scheduled: "Programado",
    published: "Publicado",
    private_link: "Enlace privado",
    archived: "Archivado",
    coming_soon: "Próximamente",
    presale: "Preventa",
    available: "Disponible",
    last_tickets: "Últimas entradas",
    sold_out: "Agotado",
    rescheduled: "Reprogramado",
    cancelled: "Cancelado",
    finished: "Finalizado",
    planned: "Planificada",
    active: "Activa",
    paused: "Pausada",
    in_review: "En revisión",
    approved: "Aprobado",
    failed: "Fallido",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    youtube: "YouTube",
    whatsapp: "WhatsApp",
    web: "MasAlto.com.ar",
  };

  return labels[value] ?? value;
}
