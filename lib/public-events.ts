import { sabrosoEvent } from "@/lib/sabroso-event";
import type { SaleStatus } from "@/lib/workspace-model";

export type PublicEventRecord = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  startDate: string;
  displayDate: string;
  displayTime: string;
  venue: {
    displayName: string;
    city: string;
  };
  saleStatus: SaleStatus;
  assets: {
    poster: string;
    hero: string;
    social: string;
  };
};

export const publicEvents: PublicEventRecord[] = [
  {
    id: "sabroso_2026",
    slug: sabrosoEvent.path.replace(/^\//, ""),
    name: sabrosoEvent.name,
    headline: sabrosoEvent.headline,
    startDate: sabrosoEvent.startDate,
    displayDate: sabrosoEvent.displayDate,
    displayTime: sabrosoEvent.displayTime,
    venue: sabrosoEvent.venue,
    saleStatus: "presale",
    assets: {
      poster: "/events/sabroso-2026/flyer.webp",
      hero: "/events/sabroso-2026/hero.webp",
      social: "/events/sabroso-2026/social.jpg",
    },
  },
];

export function getPublicEventBySlug(slug: string) {
  return publicEvents.find((event) => event.slug === slug);
}
