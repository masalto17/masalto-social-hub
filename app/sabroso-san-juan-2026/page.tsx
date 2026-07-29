import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Music2,
  Ticket,
} from "lucide-react";
import { getSabrosoTicketUrl, sabrosoEvent } from "@/lib/sabroso-event";
import styles from "./event.module.css";

const publicUrl = `https://eventos.masalto.com.ar${sabrosoEvent.path}`;

export const metadata: Metadata = {
  title: "Sabroso en San Juan | 28 de agosto de 2026",
  description: sabrosoEvent.description,
  alternates: {
    canonical: sabrosoEvent.path,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: publicUrl,
    title: "Sabroso en San Juan",
    description: `${sabrosoEvent.displayDate} · ${sabrosoEvent.displayTime} · ${sabrosoEvent.venue.displayName}`,
    images: [
      {
        url: "/events/sabroso-2026/social.jpg",
        width: 1200,
        height: 630,
        alt: "Sabroso en San Juan",
      },
    ],
  },
};

const facts = [
  {
    label: "Fecha",
    value: sabrosoEvent.displayDate,
    icon: CalendarDays,
  },
  {
    label: "Hora",
    value: sabrosoEvent.displayTime,
    icon: Clock3,
  },
  {
    label: "Lugar",
    value: `${sabrosoEvent.venue.displayName} · ${sabrosoEvent.venue.city}`,
    icon: MapPin,
  },
];

export default function SabrosoEventPage() {
  const ticketUrl = getSabrosoTicketUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: sabrosoEvent.name,
    description: sabrosoEvent.description,
    startDate: sabrosoEvent.startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: ["https://eventos.masalto.com.ar/events/sabroso-2026/social.jpg"],
    url: publicUrl,
    location: {
      "@type": "Place",
      name: sabrosoEvent.venue.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: sabrosoEvent.venue.city,
        addressRegion: sabrosoEvent.venue.region,
        addressCountry: sabrosoEvent.venue.country,
      },
    },
    performer: {
      "@type": "MusicGroup",
      name: "Sabroso",
    },
    organizer: {
      "@type": "Organization",
      name: "MasAlto Producciones",
      url: "https://masalto.com.ar",
    },
    offers: {
      "@type": "Offer",
      url: ticketUrl,
      availability: "https://schema.org/InStock",
      price: sabrosoEvent.offer.price,
      priceCurrency: sabrosoEvent.offer.priceCurrency,
      description: `${sabrosoEvent.offer.label}. ${sabrosoEvent.offer.description}`,
    },
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className={styles.hero}>
        <Image
          src="/events/sabroso-2026/hero.webp"
          alt="Flyer oficial de Sabroso en San Juan"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} aria-hidden="true" />

        <header className={styles.header}>
          <a className={styles.brand} href="https://masalto.com.ar">
            <Image
              src="/brand/masalto-producciones.trimmed.png"
              alt="MásAlto Producciones"
              width={180}
              height={92}
              priority
            />
          </a>
          <span className={styles.city}>San Juan · Argentina</span>
        </header>

        <div className={styles.heroContent}>
          <p className={styles.kicker}>
            <Music2 aria-hidden="true" size={18} />
            Una noche. Todas las épocas.
          </p>
          <h1>{sabrosoEvent.headline}</h1>
          <p className={styles.concept}>{sabrosoEvent.concept}</p>
          <div className={styles.heroMeta}>
            <span>{sabrosoEvent.displayDate}</span>
            <span>{sabrosoEvent.displayTime}</span>
            <span>{sabrosoEvent.venue.displayName}</span>
          </div>
          <p className={styles.promo}>
            {sabrosoEvent.offer.label}:{" "}
            <strong>
              $ {new Intl.NumberFormat("es-AR").format(sabrosoEvent.offer.price)}
            </strong>
          </p>
          <a
            className={styles.primaryCta}
            href={ticketUrl}
            target="_blank"
            rel="noreferrer"
            data-analytics-event="click_comprar"
            data-event-name={sabrosoEvent.name}
          >
            <Ticket aria-hidden="true" size={20} />
            Comprar entradas
            <ExternalLink aria-hidden="true" size={17} />
          </a>
        </div>

        <a className={styles.scrollCue} href="#informacion" aria-label="Ver informacion del evento">
          <ArrowDown aria-hidden="true" size={20} />
        </a>
      </section>

      <section className={styles.infoBand} id="informacion" aria-label="Informacion del evento">
        <div className={styles.infoInner}>
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div className={styles.fact} key={fact.label}>
                <Icon aria-hidden="true" size={21} />
                <div>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.promise}>
        <div>
          <p className={styles.sectionLabel}>El show completo</p>
          <h2>Las canciones de siempre. Una noche para volver a sentirlas.</h2>
        </div>
        <p>
          Sabroso llega a San Juan con sus clásicos, sus nuevas canciones y toda la energía
          de una banda que atraviesa generaciones.
        </p>
      </section>

      <section className={styles.finalCta}>
        <div>
          <span>Viernes 28 de agosto</span>
          <h2>Nos vemos del lado correcto de la noche.</h2>
        </div>
        <a
          className={styles.secondaryCta}
          href={ticketUrl}
          target="_blank"
          rel="noreferrer"
          data-analytics-event="click_comprar"
          data-event-name={sabrosoEvent.name}
        >
          Entradas en Entradaweb
          <ExternalLink aria-hidden="true" size={18} />
        </a>
      </section>

      <footer className={styles.footer}>
        <span>MasAlto Producciones</span>
        <span>Sabroso · San Juan · 2026</span>
        <a href="/privacidad">Privacidad</a>
      </footer>
    </main>
  );
}
