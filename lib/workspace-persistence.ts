import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type ActivityRecord,
  type WorkspaceState,
} from "@/lib/workspace-model";

type DatabaseError = { message: string };
type QueryResult<T> = { data: T | null; error: DatabaseError | null };
type DatabaseRow = Record<string, unknown>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireData<T>(result: QueryResult<T>, operation: string): T {
  if (result.error) throw new Error(`${operation}: ${result.error.message}`);
  if (result.data === null) throw new Error(`${operation}: respuesta sin datos`);
  return result.data;
}

function requireSuccess(result: { error: DatabaseError | null }, operation: string) {
  if (result.error) throw new Error(`${operation}: ${result.error.message}`);
}

function mappedId(id: string, ids: Map<string, string>) {
  const existing = ids.get(id);
  if (existing) return existing;
  const next = UUID_PATTERN.test(id) ? id : crypto.randomUUID();
  ids.set(id, next);
  return next;
}

export function normalizeWorkspaceIds(state: WorkspaceState): WorkspaceState {
  const eventIds = new Map<string, string>();
  const campaignIds = new Map<string, string>();
  const phaseIds = new Map<string, string>();
  const contentIds = new Map<string, string>();
  const taskIds = new Map<string, string>();
  const salesIds = new Map<string, string>();

  const events = state.events.map((event) => ({
    ...event,
    id: mappedId(event.id, eventIds),
  }));
  const campaigns = state.campaigns.map((campaign) => ({
    ...campaign,
    id: mappedId(campaign.id, campaignIds),
    eventId: campaign.eventId
      ? mappedId(campaign.eventId, eventIds)
      : null,
  }));
  const campaignPhases = state.campaignPhases.map((phase) => ({
    ...phase,
    id: mappedId(phase.id, phaseIds),
    campaignId: mappedId(phase.campaignId, campaignIds),
  }));
  const content = state.content.map((item) => ({
    ...item,
    id: mappedId(item.id, contentIds),
    campaignId: mappedId(item.campaignId, campaignIds),
  }));
  const publishingTasks = state.publishingTasks.map((task) => ({
    ...task,
    id: mappedId(task.id, taskIds),
    contentId: mappedId(task.contentId, contentIds),
  }));
  const salesSnapshots = state.salesSnapshots.map((snapshot) => ({
    ...snapshot,
    id: mappedId(snapshot.id, salesIds),
    eventId: mappedId(snapshot.eventId, eventIds),
  }));

  return {
    ...state,
    events,
    campaigns,
    campaignPhases,
    content,
    publishingTasks,
    salesSnapshots,
    activity: [],
  };
}

async function getWorkspaceIdentity(client: SupabaseClient) {
  const user = requireData(
    (await client.auth.getUser()) as QueryResult<{ user: { id: string } | null }>,
    "No se pudo validar la sesión",
  ).user;
  if (!user) throw new Error("No hay una sesión autenticada.");

  const memberships = requireData(
    (await client
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(2)) as QueryResult<Array<{ organization_id: string }>>,
    "No se pudo resolver la organización",
  );
  if (memberships.length !== 1) {
    throw new Error(
      memberships.length === 0
        ? "La cuenta no pertenece a una organización."
        : "La cuenta pertenece a más de una organización; se requiere selección explícita.",
    );
  }

  return { organizationId: memberships[0].organization_id, userId: user.id };
}

function asNumberMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] =>
      typeof entry[1] === "number" && Number.isFinite(entry[1]),
    ),
  );
}

function mapActivity(row: DatabaseRow): ActivityRecord {
  const entityTypes: Record<string, ActivityRecord["entityType"]> = {
    events: "event",
    campaigns: "campaign",
    campaign_phases: "campaign_phase",
    content_assets: "content",
    publishing_tasks: "publishing_task",
    sales_snapshots: "sales_import",
  };
  return {
    id: String(row.id),
    entityType: entityTypes[String(row.entity_type)] ?? "event",
    entityId: String(row.entity_id),
    action: `${String(row.entity_type)}.${String(row.action)}`,
    summary: String(row.summary ?? ""),
    actor: row.actor_id ? "Hugo" : "Sistema demo",
    createdAt: String(row.created_at),
  };
}

export async function loadWorkspace(client: SupabaseClient): Promise<WorkspaceState> {
  const { organizationId } = await getWorkspaceIdentity(client);
  const [events, campaigns, phases, content, tasks, sales, activity] =
    await Promise.all([
      client.from("events").select("*").eq("organization_id", organizationId),
      client.from("campaigns").select("*").eq("organization_id", organizationId),
      client.from("campaign_phases").select("*").eq("organization_id", organizationId),
      client.from("content_assets").select("*").eq("organization_id", organizationId),
      client.from("publishing_tasks").select("*").eq("organization_id", organizationId),
      client.from("sales_snapshots").select("*").eq("organization_id", organizationId),
      client
        .from("activity_log")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  const eventRows = requireData(events as QueryResult<DatabaseRow[]>, "Leer eventos");
  const campaignRows = requireData(
    campaigns as QueryResult<DatabaseRow[]>,
    "Leer campañas",
  );
  const phaseRows = requireData(phases as QueryResult<DatabaseRow[]>, "Leer fases");
  const contentRows = requireData(content as QueryResult<DatabaseRow[]>, "Leer contenido");
  const taskRows = requireData(tasks as QueryResult<DatabaseRow[]>, "Leer publicaciones");
  const salesRows = requireData(sales as QueryResult<DatabaseRow[]>, "Leer ventas");
  const activityRows = requireData(
    activity as QueryResult<DatabaseRow[]>,
    "Leer actividad",
  );

  return {
    version: 4,
    events: eventRows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      startsAt: String(row.starts_at),
      venueName: String(row.venue_name),
      city: String(row.city),
      capacity: row.capacity === null ? null : Number(row.capacity),
      ecosystemMode: row.ecosystem_mode as WorkspaceState["events"][number]["ecosystemMode"],
      websiteStatus: row.website_status as WorkspaceState["events"][number]["websiteStatus"],
      saleStatus: row.sale_status as WorkspaceState["events"][number]["saleStatus"],
      ticketingProvider:
        row.ticketing_provider as WorkspaceState["events"][number]["ticketingProvider"],
      externalTicketUrl: row.external_ticket_url
        ? String(row.external_ticket_url)
        : null,
      accredEnabled: false,
      createdAt: String(row.created_at),
    })),
    campaigns: campaignRows.map((row) => ({
      id: String(row.id),
      eventId: row.event_id ? String(row.event_id) : null,
      name: String(row.name),
      objective: String(row.objective),
      audience: String(row.audience),
      creativeConcept: String(row.creative_concept),
      budgetAmount: row.budget_amount === null ? null : Number(row.budget_amount),
      budgetCurrency: "ARS",
      startsAt: String(row.starts_at),
      endsAt: String(row.ends_at),
      status: row.status as WorkspaceState["campaigns"][number]["status"],
      createdAt: String(row.created_at),
    })),
    campaignPhases: phaseRows.map((row) => ({
      id: String(row.id),
      campaignId: String(row.campaign_id),
      type: row.type as WorkspaceState["campaignPhases"][number]["type"],
      name: String(row.name),
      objective: String(row.objective),
      startsAt: String(row.starts_at),
      endsAt: String(row.ends_at),
      channels: row.channels as WorkspaceState["campaignPhases"][number]["channels"],
      createdAt: String(row.created_at),
    })),
    content: contentRows.map((row) => ({
      id: String(row.id),
      campaignId: String(row.campaign_id),
      title: String(row.title),
      baseCopy: String(row.base_copy),
      format: String(row.format),
      status: row.status as WorkspaceState["content"][number]["status"],
      approvedBy: row.approved_by ? "Hugo" : null,
      approvedAt: row.approved_at ? String(row.approved_at) : null,
      createdAt: String(row.created_at),
    })),
    publishingTasks: taskRows.map((row) => ({
      id: String(row.id),
      contentId: String(row.content_id),
      channel: row.channel as WorkspaceState["publishingTasks"][number]["channel"],
      copy: String(row.copy),
      scheduledAt: String(row.scheduled_at),
      status: row.status as WorkspaceState["publishingTasks"][number]["status"],
      provider: "manual",
    })),
    salesSnapshots: salesRows.map((row) => ({
      id: String(row.id),
      eventId: String(row.event_id),
      source: "entradaweb",
      buyerRows: Number(row.buyer_rows),
      totalTickets: Number(row.total_tickets),
      rejectedRows: Number(row.rejected_rows),
      byDevice: asNumberMap(row.by_device),
      byProvince: asNumberMap(row.by_province),
      byLocality: asNumberMap(row.by_locality),
      importedAt: String(row.imported_at),
    })),
    activity: activityRows.map(mapActivity),
  };
}

export async function persistWorkspace(
  client: SupabaseClient,
  sourceState: WorkspaceState,
) {
  const { organizationId, userId } = await getWorkspaceIdentity(client);
  const state = normalizeWorkspaceIds(sourceState);

  const operations: Array<PromiseLike<{ error: DatabaseError | null }>> = [];
  if (state.events.length) {
    operations.push(
      client.from("events").upsert(
        state.events.map((event) => ({
          id: event.id,
          organization_id: organizationId,
          name: event.name,
          slug: event.slug,
          starts_at: event.startsAt,
          venue_name: event.venueName,
          city: event.city,
          capacity: event.capacity,
          ecosystem_mode: event.ecosystemMode,
          website_status: event.websiteStatus,
          sale_status: event.saleStatus,
          ticketing_provider: event.ticketingProvider,
          external_ticket_url: event.externalTicketUrl,
          accred_enabled: false,
          created_by: userId,
          created_at: event.createdAt,
        })),
      ),
    );
  }
  if (state.campaigns.length) {
    operations.push(
      client.from("campaigns").upsert(
        state.campaigns.map((campaign) => ({
          id: campaign.id,
          organization_id: organizationId,
          event_id: campaign.eventId,
          name: campaign.name,
          objective: campaign.objective,
          audience: campaign.audience,
          creative_concept: campaign.creativeConcept,
          budget_amount: campaign.budgetAmount,
          budget_currency: "ARS",
          starts_at: campaign.startsAt,
          ends_at: campaign.endsAt,
          status: campaign.status,
          created_by: userId,
          created_at: campaign.createdAt,
        })),
      ),
    );
  }
  if (state.campaignPhases.length) {
    operations.push(
      client.from("campaign_phases").upsert(
        state.campaignPhases.map((phase) => ({
          id: phase.id,
          organization_id: organizationId,
          campaign_id: phase.campaignId,
          type: phase.type,
          name: phase.name,
          objective: phase.objective,
          starts_at: phase.startsAt,
          ends_at: phase.endsAt,
          channels: phase.channels,
          created_by: userId,
          created_at: phase.createdAt,
        })),
      ),
    );
  }
  if (state.content.length) {
    operations.push(
      client.from("content_assets").upsert(
        state.content.map((item) => ({
          id: item.id,
          organization_id: organizationId,
          campaign_id: item.campaignId,
          title: item.title,
          base_copy: item.baseCopy,
          format: item.format,
          status: item.status,
          approved_by: item.approvedAt ? userId : null,
          approved_at: item.approvedAt,
          created_by: userId,
          created_at: item.createdAt,
        })),
      ),
    );
  }
  if (state.publishingTasks.length) {
    operations.push(
      client.from("publishing_tasks").upsert(
        state.publishingTasks.map((task) => ({
          id: task.id,
          organization_id: organizationId,
          content_id: task.contentId,
          channel: task.channel,
          copy: task.copy,
          scheduled_at: task.scheduledAt,
          status: task.status,
          provider: "manual",
          created_by: userId,
        })),
      ),
    );
  }

  for (const operation of operations) {
    requireSuccess(await operation, "Guardar workspace");
  }
  if (state.salesSnapshots.length) {
    requireSuccess(
      await client.from("sales_snapshots").upsert(
        state.salesSnapshots.map((snapshot) => ({
          id: snapshot.id,
          organization_id: organizationId,
          event_id: snapshot.eventId,
          source: "entradaweb",
          buyer_rows: snapshot.buyerRows,
          total_tickets: snapshot.totalTickets,
          rejected_rows: snapshot.rejectedRows,
          by_device: snapshot.byDevice,
          by_province: snapshot.byProvince,
          by_locality: snapshot.byLocality,
          imported_at: snapshot.importedAt,
          created_by: userId,
        })),
        { onConflict: "id", ignoreDuplicates: true },
      ),
      "Guardar ventas",
    );
  }

  return state;
}

export async function migrateLocalWorkspace(
  client: SupabaseClient,
  localState: WorkspaceState,
) {
  const remoteState = await loadWorkspace(client);
  const remoteHasData = Object.entries(remoteState)
    .filter(([key]) => !["version", "activity"].includes(key))
    .some(([, value]) => Array.isArray(value) && value.length > 0);
  if (remoteHasData) return remoteState;

  await persistWorkspace(client, localState);
  return loadWorkspace(client);
}
