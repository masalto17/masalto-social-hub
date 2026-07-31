import { expect, test } from "@playwright/test";
import {
  getPhaseTaskCount,
  getUncoveredCampaignPhases,
} from "@/lib/campaign-phases";
import { demoWorkspace } from "@/lib/demo-workspace";

test("counts publication tasks inside each phase window", () => {
  const announcement = demoWorkspace.campaignPhases.find(
    (phase) => phase.type === "announcement",
  );

  expect(announcement).toBeTruthy();
  expect(getPhaseTaskCount(demoWorkspace, announcement!)).toBe(3);
});

test("detects campaign phases without planned publications", () => {
  expect(
    getUncoveredCampaignPhases(demoWorkspace).map((phase) => phase.type),
  ).toEqual(["intrigue", "desire", "conversion", "urgency"]);
});
