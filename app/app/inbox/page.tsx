import { Inbox, MessageCircleWarning } from "lucide-react";
import styles from "../workspace.module.css";

const categories = [
  "Precio y entradas",
  "Horario y ubicación",
  "Prensa",
  "Problema de compra",
  "Proveedor",
  "Reclamo sensible",
];

export default function InboxPage() {
  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Conversaciones</p>
          <h1>Inbox</h1>
        </div>
      </header>

      <p className={styles.notice}>
        Sin conexiones reales. Meta, TikTok, YouTube y WhatsApp requieren credenciales y
        revisión de permisos antes de leer o responder mensajes.
      </p>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Estado</p>
              <h2>Bandeja sin conectar</h2>
            </div>
            <Inbox aria-hidden="true" size={22} />
          </div>
          <div className={styles.empty}>
            Las conversaciones aparecerán aquí cuando se apruebe el primer conector.
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Clasificación prevista</p>
              <h2>Derivación segura</h2>
            </div>
            <MessageCircleWarning aria-hidden="true" size={22} />
          </div>
          <div className={styles.list}>
            {categories.map((category) => (
              <div className={styles.rowTitle} key={category}>
                <strong>{category}</strong>
                <span className={styles.muted}>
                  Reclamos y problemas de compra siempre pasan a una persona.
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
