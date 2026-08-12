"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { authorizeContentOperation } from "@/app/app/contenido/actions";
import { demoWorkspace } from "@/lib/demo-workspace";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  loadWorkspace,
  migrateLocalWorkspace,
  persistWorkspace,
} from "@/lib/workspace-persistence";
import {
  emptyWorkspace,
  uniqueSlug,
  type ActivityRecord,
  type NewCampaignPhaseInput,
  type NewCampaignInput,
  type NewContentInput,
  type NewEventInput,
  type NewSalesSnapshotInput,
  type WorkspaceState,
} from "@/lib/workspace-model";

const STORAGE_KEY = "masalto_social_hub_workspace_v4";
const LEGACY_STORAGE_KEYS = [
  "masalto_social_hub_workspace_v3",
  "masalto_social_hub_workspace_v2",
  "masalto_social_hub_workspace_v1",
] as const;

function readStoredWorkspace() {
  const raw =
    window.localStorage.getItem(STORAGE_KEY) ??
    LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
  if (!raw) return null;

  const stored = JSON.parse(raw) as WorkspaceState & {
    version: 1 | 2 | 3 | 4;
    salesSnapshots?: WorkspaceState["salesSnapshots"];
    campaignPhases?: WorkspaceState["campaignPhases"];
    publishingTasks: Array<
      Omit<WorkspaceState["publishingTasks"][number], "copy"> & {
        copy?: string;
      }
    >;
  };
  return {
    ...stored,
    version: 4,
    salesSnapshots: stored.salesSnapshots ?? [],
    campaignPhases: stored.campaignPhases ?? [],
    publishingTasks: stored.publishingTasks.map((task) => {
      const content = stored.content.find((item) => item.id === task.contentId);
      return { ...task, copy: task.copy ?? content?.baseCopy ?? "" };
    }),
  } satisfies WorkspaceState;
}

function clearStoredWorkspace() {
  window.localStorage.removeItem(STORAGE_KEY);
  LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

type WorkspaceAction =
  | { type: "hydrate"; state: WorkspaceState }
  | { type: "create_event"; input: NewEventInput }
  | { type: "create_campaign"; input: NewCampaignInput }
  | { type: "create_campaign_phase"; input: NewCampaignPhaseInput }
  | { type: "create_content"; input: NewContentInput }
  | { type: "import_sales"; input: NewSalesSnapshotInput }
  | {
      type: "approve_content";
      contentId: string;
      approvedBy: string;
      approvedAt: string;
    }
  | { type: "schedule_content"; contentId: string }
  | { type: "move_task"; taskId: string; scheduledAt: string }
  | { type: "reset_demo" };

type WorkspaceContextValue = {
  state: WorkspaceState;
  hydrated: boolean;
  persistence: "local" | "supabase";
  createEvent: (input: NewEventInput) => void;
  createCampaign: (input: NewCampaignInput) => void;
  createCampaignPhase: (input: NewCampaignPhaseInput) => boolean;
  createContent: (input: NewContentInput) => void;
  importSales: (input: NewSalesSnapshotInput) => void;
  approveContent: (contentId: string) => Promise<boolean>;
  scheduleContent: (contentId: string) => Promise<boolean>;
  moveTask: (taskId: string, scheduledAt: string) => void;
  resetDemo: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function activity(
  entityType: ActivityRecord["entityType"],
  entityId: string,
  action: string,
  summary: string,
): ActivityRecord {
  return {
    id: crypto.randomUUID(),
    entityType,
    entityId,
    action,
    summary,
    actor: "Hugo",
    createdAt: new Date().toISOString(),
  };
}

function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "hydrate":
      return action.state.version === 4 ? action.state : demoWorkspace;
    case "create_event": {
      const id = crypto.randomUUID();
      const event = {
        ...action.input,
        id,
        slug: uniqueSlug(
          action.input.name,
          state.events.map((current) => current.slug),
        ),
        accredEnabled: false as const,
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        events: [...state.events, event],
        activity: [
          activity(
            "event",
            id,
            "event.created",
            `${event.name} fue creado en modo ${event.ecosystemMode}.`,
          ),
          ...state.activity,
        ],
      };
    }
    case "create_campaign": {
      const id = crypto.randomUUID();
      const campaign = {
        ...action.input,
        id,
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        campaigns: [...state.campaigns, campaign],
        activity: [
          activity(
            "campaign",
            id,
            "campaign.created",
            `${campaign.name} fue creada como ${campaign.status}.`,
          ),
          ...state.activity,
        ],
      };
    }
    case "create_campaign_phase": {
      const campaign = state.campaigns.find(
        (item) => item.id === action.input.campaignId,
      );
      const startsAt = new Date(action.input.startsAt).getTime();
      const endsAt = new Date(action.input.endsAt).getTime();
      if (
        !campaign ||
        endsAt <= startsAt ||
        startsAt < new Date(campaign.startsAt).getTime() ||
        endsAt > new Date(campaign.endsAt).getTime()
      ) {
        return state;
      }

      const id = crypto.randomUUID();
      const phase = {
        ...action.input,
        id,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        campaignPhases: [...state.campaignPhases, phase],
        activity: [
          activity(
            "campaign_phase",
            id,
            "campaign_phase.created",
            `${phase.name} fue agregada a ${campaign.name}.`,
          ),
          ...state.activity,
        ],
      };
    }
    case "create_content": {
      const id = crypto.randomUUID();
      const content = {
        campaignId: action.input.campaignId,
        title: action.input.title,
        baseCopy: action.input.baseCopy,
        format: action.input.format,
        status: action.input.status,
        id,
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date().toISOString(),
      };
      const tasks = action.input.channels.map((channel) => ({
        id: crypto.randomUUID(),
        contentId: id,
        channel,
        copy: action.input.channelCopies[channel]?.trim() || content.baseCopy,
        scheduledAt: action.input.scheduledAt,
        status: action.input.status,
        provider: "manual" as const,
      }));

      return {
        ...state,
        content: [...state.content, content],
        publishingTasks: [...state.publishingTasks, ...tasks],
        activity: [
          activity(
            "content",
            id,
            "content.created",
            `${content.title} fue creada para ${tasks.length} canales.`,
          ),
          ...state.activity,
        ],
      };
    }
    case "import_sales": {
      const id = crypto.randomUUID();
      const snapshot = {
        ...action.input,
        id,
        source: "entradaweb" as const,
        importedAt: new Date().toISOString(),
      };

      return {
        ...state,
        salesSnapshots: [...state.salesSnapshots, snapshot],
        activity: [
          activity(
            "sales_import",
            id,
            "sales.imported",
            `${snapshot.totalTickets} entradas agregadas desde EntradaWeb sin conservar PII.`,
          ),
          ...state.activity,
        ],
      };
    }
    case "approve_content": {
      const current = state.content.find((item) => item.id === action.contentId);
      if (
        !current ||
        !["draft", "in_review", "failed"].includes(current.status)
      ) {
        return state;
      }

      return {
        ...state,
        content: state.content.map((item) =>
          item.id === action.contentId
            ? {
                ...item,
                status: "approved",
                approvedBy: action.approvedBy,
                approvedAt: action.approvedAt,
              }
            : item,
        ),
        activity: [
          activity(
            "content",
            action.contentId,
            "content.approved",
            `${current.title} fue aprobado por ${action.approvedBy}.`,
          ),
          ...state.activity,
        ],
      };
    }
    case "schedule_content": {
      const current = state.content.find((item) => item.id === action.contentId);
      if (!current || current.status !== "approved") return state;

      return {
        ...state,
        content: state.content.map((item) =>
          item.id === action.contentId ? { ...item, status: "scheduled" } : item,
        ),
        publishingTasks: state.publishingTasks.map((task) =>
          task.contentId === action.contentId ? { ...task, status: "scheduled" } : task,
        ),
        activity: [
          activity(
            "content",
            action.contentId,
            "content.scheduled",
            `${current.title} quedó listo para publicación manual.`,
          ),
          ...state.activity,
        ],
      };
    }
    case "move_task": {
      const current = state.publishingTasks.find((task) => task.id === action.taskId);
      if (!current) return state;

      return {
        ...state,
        publishingTasks: state.publishingTasks.map((task) =>
          task.id === action.taskId
            ? { ...task, scheduledAt: action.scheduledAt }
            : task,
        ),
        activity: [
          activity(
            "publishing_task",
            action.taskId,
            "publishing_task.rescheduled",
            `Publicación reprogramada para ${action.scheduledAt}.`,
          ),
          ...state.activity,
        ],
      };
    }
    case "reset_demo":
      return demoWorkspace;
    default:
      return state;
  }
}

export function WorkspaceProvider({
  children,
  useSupabase = false,
}: {
  children: React.ReactNode;
  useSupabase?: boolean;
}) {
  const [state, dispatch] = useReducer(
    reducer,
    useSupabase ? emptyWorkspace : demoWorkspace,
  );
  const [hydrated, setHydrated] = useState(false);
  const skipNextRemoteWrite = useRef(false);
  const remoteWriteQueue = useRef(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    const restore = window.setTimeout(async () => {
      try {
        const stored = readStoredWorkspace();
        if (useSupabase) {
          const client = createBrowserSupabaseClient();
          const remoteState = stored
            ? await migrateLocalWorkspace(client, stored)
            : await loadWorkspace(client);
          if (cancelled) return;
          skipNextRemoteWrite.current = true;
          dispatch({ type: "hydrate", state: remoteState });
          clearStoredWorkspace();
        } else if (stored) {
          dispatch({ type: "hydrate", state: stored });
          LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
        }
      } catch {
        if (!useSupabase) clearStoredWorkspace();
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(restore);
    };
  }, [useSupabase]);

  useEffect(() => {
    if (!hydrated) return;
    if (!useSupabase) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return;
    }
    if (skipNextRemoteWrite.current) {
      skipNextRemoteWrite.current = false;
      return;
    }

    remoteWriteQueue.current = remoteWriteQueue.current
      .then(() => persistWorkspace(createBrowserSupabaseClient(), state))
      .then(() => undefined)
      .catch((error: unknown) => {
        console.error("No se pudo persistir el workspace en Supabase.", error);
      });
  }, [hydrated, state, useSupabase]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      state,
      hydrated,
      persistence: useSupabase ? "supabase" : "local",
      createEvent: (input) => dispatch({ type: "create_event", input }),
      createCampaign: (input) => dispatch({ type: "create_campaign", input }),
      createCampaignPhase: (input) => {
        const campaign = state.campaigns.find(
          (item) => item.id === input.campaignId,
        );
        const valid =
          Boolean(campaign) &&
          new Date(input.endsAt) > new Date(input.startsAt) &&
          new Date(input.startsAt) >= new Date(campaign!.startsAt) &&
          new Date(input.endsAt) <= new Date(campaign!.endsAt);
        if (valid) dispatch({ type: "create_campaign_phase", input });
        return valid;
      },
      createContent: (input) => dispatch({ type: "create_content", input }),
      importSales: (input) => dispatch({ type: "import_sales", input }),
      approveContent: async (contentId) => {
        const authorization = await authorizeContentOperation("approve", contentId);
        if (!authorization.authorized) return false;
        dispatch({
          type: "approve_content",
          contentId,
          approvedBy: authorization.actor,
          approvedAt: authorization.authorizedAt,
        });
        return true;
      },
      scheduleContent: async (contentId) => {
        const canSchedule = state.content.some(
          (item) => item.id === contentId && item.status === "approved",
        );
        if (!canSchedule) return false;
        const authorization = await authorizeContentOperation("schedule", contentId);
        if (!authorization.authorized) return false;
        dispatch({ type: "schedule_content", contentId });
        return true;
      },
      moveTask: (taskId, scheduledAt) =>
        dispatch({ type: "move_task", taskId, scheduledAt }),
      resetDemo: () => {
        if (!useSupabase) dispatch({ type: "reset_demo" });
      },
    }),
    [hydrated, state, useSupabase],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace debe utilizarse dentro de WorkspaceProvider");
  return value;
}
