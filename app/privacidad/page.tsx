import type { Metadata } from "next";
import Link from "next/link";
import { getAnalyticsConfig } from "@/lib/analytics-config";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacidad | MasAlto Producciones",
  description: "Información sobre privacidad y medición en los eventos de MasAlto.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
  const { privacyContactEmail } = getAnalyticsConfig();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/">MasAlto Producciones</Link>
        </div>
      </header>

      <article className={styles.content}>
        <p className={styles.status}>Borrador sujeto a validación legal y comercial</p>
        <h1>Política de privacidad</h1>
        <p className={styles.intro}>
          Esta versión explica la medición prevista para las páginas de eventos. La
          analítica permanece desactivada hasta completar los datos del responsable,
          aprobar esta política y configurar los identificadores oficiales de MasAlto.
        </p>

        <section>
          <h2>Responsable</h2>
          <p>
            MasAlto Producciones, San Juan, Argentina. El nombre legal completo, domicilio
            y canal definitivo para ejercer derechos deben confirmarse antes de activar
            la medición.
          </p>
          {privacyContactEmail ? (
            <p>
              Contacto de privacidad:{" "}
              <a href={`mailto:${privacyContactEmail}`}>{privacyContactEmail}</a>.
            </p>
          ) : (
            <p>Canal de privacidad: pendiente de confirmación.</p>
          )}
        </section>

        <section>
          <h2>Qué medimos</h2>
          <ul>
            <li>Visitas a las páginas de eventos.</li>
            <li>Origen de campaña mediante parámetros UTM.</li>
            <li>Clics que inician la compra de entradas.</li>
            <li>Datos técnicos generales del navegador y dispositivo.</li>
          </ul>
        </section>

        <section>
          <h2>Herramientas y finalidad</h2>
          <p>
            Con consentimiento, podremos usar Meta Pixel y Google Analytics 4 para medir
            el rendimiento de campañas y atribuir compras. EntradaWeb gestiona su
            checkout bajo sus propias condiciones y política; MasAlto no procesa el pago
            en esta página.
          </p>
        </section>

        <section>
          <h2>Consentimiento</h2>
          <p>
            La medición opcional queda bloqueada por defecto. Podés aceptar o rechazarla
            desde el aviso de privacidad y cambiar tu decisión después. Las funciones
            estrictamente necesarias del sitio no dependen de esta elección.
          </p>
        </section>

        <section>
          <h2>Tus derechos</h2>
          <p>
            Podés solicitar información, acceso, rectificación, actualización o supresión
            de tus datos según la Ley 25.326. La versión final incluirá el canal formal y
            los plazos de conservación aprobados.
          </p>
        </section>

        <section>
          <h2>Más información</h2>
          <p>
            Consultá la{" "}
            <a
              href="https://www.argentina.gob.ar/aaip/datospersonales/derechos"
              target="_blank"
              rel="noreferrer"
            >
              guía oficial de derechos de la AAIP
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
