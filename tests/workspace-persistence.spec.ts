import { expect, test } from "@playwright/test";
import { demoWorkspace } from "@/lib/demo-workspace";
import { normalizeWorkspaceIds } from "@/lib/workspace-persistence";

test("normalizes legacy local IDs without breaking workspace relations", () => {
  const migrated = normalizeWorkspaceIds(demoWorkspace);
  const eventIds = new Set(migrated.events.map((event) => event.id));
  const campaignIds = new Set(migrated.campaigns.map((campaign) => campaign.id));
  const contentIds = new Set(migrated.content.map((content) => content.id));
  const uuid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;

  expect(migrated.events.every((event) => uuid.test(event.id))).toBe(true);
  expect(
    migrated.campaigns.every(
      (campaign) => !campaign.eventId || eventIds.has(campaign.eventId),
    ),
  ).toBe(true);
  expect(
    migrated.campaignPhases.every((phase) => campaignIds.has(phase.campaignId)),
  ).toBe(true);
  expect(migrated.content.every((item) => campaignIds.has(item.campaignId))).toBe(
    true,
  );
  expect(
    migrated.publishingTasks.every((task) => contentIds.has(task.contentId)),
  ).toBe(true);
  expect(migrated.activity).toEqual([]);
});
