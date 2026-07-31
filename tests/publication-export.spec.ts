import { expect, test } from "@playwright/test";
import { demoWorkspace } from "@/lib/demo-workspace";
import {
  buildPublicationCsv,
  publicationExportFilename,
} from "@/lib/publication-export";

test("exports the publication plan in chronological order", () => {
  const csv = buildPublicationCsv(demoWorkspace);
  const firstTask = [...demoWorkspace.publishingTasks].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  )[0];
  const firstContent = demoWorkspace.content.find(
    (item) => item.id === firstTask.contentId,
  );
  const firstCampaign = demoWorkspace.campaigns.find(
    (item) => item.id === firstContent?.campaignId,
  );

  expect(csv).toMatch(/^\uFEFF"Fecha programada";"Canal"/);
  expect(csv.indexOf(firstTask.scheduledAt)).toBeGreaterThan(0);
  expect(csv).toContain(`"${firstCampaign?.name}"`);
});

test("neutralizes spreadsheet formulas in exported copy", () => {
  const state = {
    ...demoWorkspace,
    publishingTasks: demoWorkspace.publishingTasks.map((task, index) =>
      index === 0 ? { ...task, copy: "=HYPERLINK(\"bad\")" } : task,
    ),
  };

  expect(buildPublicationCsv(state)).toContain(
    `"'=HYPERLINK(""bad"")"`,
  );
});

test("uses an explicit date in the export filename", () => {
  expect(publicationExportFilename(new Date("2026-08-01T12:00:00Z"))).toBe(
    "plan-publicaciones-2026-08-01.csv",
  );
});
