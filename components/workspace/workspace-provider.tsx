"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { demoWorkspace } from "@/lib/demo-workspace";
import {
  uniqueSlug,
  type ActivityRecord,
  type NewCampaignInput,
  type NewContentInput,
  type NewEventInput,
  type WorkspaceState,
} from "@/lib/workspace-model";

const STORAGE_KEY = "masalto_social_hub_workspace_v1";

type WorkspaceAction =
  | { type: "hydrate"; state: WorkspaceState }
  | { type: "create_event"; input: NewEventInput }
  | { type: "create_campaign"; input: NewCampaignInput }
  | { type: "create_content"; input: NewContentInput }
  | { type: "approve_content"; contentId: string }
  | { type: "schedule_content"; contentId: string }
  | { type: "move_task"; taskId: string; scheduledAt: string }
  | { type: "reset_demo" };

type WorkspaceContextValue = {
  state: WorkspaceState;
  hydrated: boolean;
  createEvent: (input: NewEventInput) => void;
  createCampaign: (input: NewCampaignInput) => void;
  createContent: (input: NewContentInput) => void;
  approveContent: (contentId: string) => void;
  scheduleContent: (contentId: string) => boolean;
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
      return action.state.version === 1 ? action.state : demoWorkspace;
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
                approvedBy: "Hugo",
                approvedAt: new Date().toISOString(),
              }
            : item,
        ),
        activity: [
          activity(
            "content",
            action.contentId,
            "content.approved",
            `${current.title} fue aprobado por Hugo.`,
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

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, demoWorkspace);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) as WorkspaceState });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      state,
      hydrated,
      createEvent: (input) => dispatch({ type: "create_event", input }),
      createCampaign: (input) => dispatch({ type: "create_campaign", input }),
      createContent: (input) => dispatch({ type: "create_content", input }),
      approveContent: (contentId) =>
        dispatch({ type: "approve_content", contentId }),
      scheduleContent: (contentId) => {
        const canSchedule = state.content.some(
          (item) => item.id === contentId && item.status === "approved",
        );
        if (canSchedule) dispatch({ type: "schedule_content", contentId });
        return canSchedule;
      },
      moveTask: (taskId, scheduledAt) =>
        dispatch({ type: "move_task", taskId, scheduledAt }),
      resetDemo: () => dispatch({ type: "reset_demo" }),
    }),
    [hydrated, state],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace debe utilizarse dentro de WorkspaceProvider");
  return value;
}
