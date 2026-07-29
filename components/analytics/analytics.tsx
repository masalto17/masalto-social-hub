"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import type { AnalyticsConfig } from "@/lib/analytics-config";
import styles from "./analytics.module.css";

type ConsentChoice = "accepted" | "rejected";

const CONSENT_STORAGE_KEY = "masalto_analytics_consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function Analytics({ config }: { config: AnalyticsConfig }) {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    if (!config.enabled) return;

    const savedChoice = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (savedChoice === "accepted" || savedChoice === "rejected") {
      const restoreChoice = window.setTimeout(() => setConsent(savedChoice), 0);
      return () => window.clearTimeout(restoreChoice);
    }
  }, [config.enabled]);

  useEffect(() => {
    if (!config.enabled || consent !== "accepted") return;

    const trackCheckout = (event: MouseEvent) => {
      const element = event.target;
      if (!(element instanceof Element)) return;
      if (!element.closest('[data-analytics-event="click_comprar"]')) return;

      const eventName =
        element.closest<HTMLElement>("[data-event-name]")?.dataset.eventName ??
        document.title;

      window.fbq?.("track", "InitiateCheckout", {
        content_name: eventName,
      });
      window.gtag?.("event", "begin_checkout", {
        event_category: "ticketing",
        event_label: eventName,
      });
    };

    document.addEventListener("click", trackCheckout);
    return () => document.removeEventListener("click", trackCheckout);
  }, [config.enabled, consent]);

  if (!config.enabled) return null;

  const setChoice = (choice: ConsentChoice) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    setConsent(choice);
  };

  return (
    <>
      {consent === "accepted" && config.metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init',${JSON.stringify(config.metaPixelId)});
fbq('track','PageView');
if(window.location.pathname==='/sabroso-san-juan-2026'){
fbq('track','ViewContent',{content_name:'Sabroso en San Juan',
content_ids:['sabroso_2026'],content_type:'product'});}`}
        </Script>
      ) : null}

      {consent === "accepted" && config.ga4MeasurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
gtag('config',${JSON.stringify(config.ga4MeasurementId)});`}
          </Script>
        </>
      ) : null}

      {consent === null ? (
        <aside className={styles.banner} aria-label="Preferencias de privacidad">
          <p>
            Usamos medición opcional de Meta y Google para saber qué campañas generan
            visitas y compras. No se activa sin tu permiso.{" "}
            <Link href="/privacidad">Ver política de privacidad</Link>.
          </p>
          <div className={styles.actions}>
            <button
              className={styles.accept}
              type="button"
              onClick={() => setChoice("accepted")}
            >
              Aceptar medición
            </button>
            <button
              className={styles.reject}
              type="button"
              onClick={() => setChoice("rejected")}
            >
              Solo lo necesario
            </button>
          </div>
        </aside>
      ) : (
        <button
          className={styles.preferences}
          type="button"
          onClick={() => setConsent(null)}
          aria-label="Cambiar preferencias de privacidad"
          title="Cambiar preferencias de privacidad"
        >
          <Settings2 aria-hidden="true" size={20} />
        </button>
      )}
    </>
  );
}
