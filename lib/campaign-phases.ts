import type {
  CampaignPhaseRecord,
  WorkspaceState,
} from "@/lib/workspace-model";

export function getPhaseTaskCount(
  state: WorkspaceState,
  phase: CampaignPhaseRecord,
) {
  const contentIds = new Set(
    state.content
      .filter((item) => item.campaignId === phase.campaignId)
      .map((item) => item.id),
  );
  const startsAt = new Date(phase.startsAt).getTime();
  const endsAt = new Date(phase.endsAt).getTime();

  return state.publishingTasks.filter((task) => {
    const scheduledAt = new Date(task.scheduledAt).getTime();
    return (
      contentIds.has(task.contentId) &&
      scheduledAt >= startsAt &&
      scheduledAt <= endsAt
    );
  }).length;
}

export function getUncoveredCampaignPhases(state: WorkspaceState) {
  return state.campaignPhases.filter(
    (phase) => getPhaseTaskCount(state, phase) === 0,
  );
}
