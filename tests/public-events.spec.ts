import { expect, test } from "@playwright/test";
import {
  getPublicEventBySlug,
  publicEvents,
} from "@/lib/public-events";

test("keeps public event slugs unique", () => {
  const slugs = publicEvents.map((event) => event.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});

test("resolves Sabroso from the shared public registry", () => {
  const event = getPublicEventBySlug("sabroso-san-juan-2026");

  expect(event?.name).toBe("Sabroso en San Juan");
  expect(event?.startDate).toBe("2026-08-28T23:00:00-03:00");
  expect(event?.assets.poster).toMatch(/^\/events\/sabroso-2026\//);
});
