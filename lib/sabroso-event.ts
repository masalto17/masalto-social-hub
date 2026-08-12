export const sabrosoEvent = {
  name: "Sabroso en San Juan",
  headline: "Sabroso",
  concept: "Del lado correcto de la noche",
  description:
    "Todos los clásicos, las nuevas canciones y el show completo de Sabroso en San Juan.",
  startDate: "2026-08-28T23:00:00-03:00",
  displayDate: "28 de agosto de 2026",
  displayTime: "23:00 h",
  venue: {
    name: "Hugo Espectáculos",
    displayName: "Hugo Espectáculos",
    city: "San Juan",
    region: "San Juan",
    country: "AR",
  },
  campaign: "sabroso_2026",
  path: "/sabroso-san-juan-2026",
  offer: {
    price: 15000,
    priceCurrency: "ARS",
    label: "Primeras 500 anticipadas",
    description: "Valor promocional sujeto a disponibilidad.",
    validFrom: "2026-07-29T00:00:00-03:00",
  },
} as const;

export function getSabrosoTicketUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SABROSO_TICKET_URL?.trim();

  if (!configuredUrl) {
    return "#";
  }

  let url: URL;

  try {
    url = new URL(configuredUrl);
  } catch {
    return "#";
  }

  url.searchParams.set("utm_source", "masalto");
  url.searchParams.set("utm_medium", "event_page");
  url.searchParams.set("utm_campaign", sabrosoEvent.campaign);

  return url.toString();
}
