"use client";

import { Megaphone, Plus } from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { formatStatus } from "@/lib/workspace-model";
import styles from "../workspace.module.css";

export default function CampaignsPage() {
  const { state } = useWorkspace();

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Planificación</p>
          <h1>Campañas</h1>
        </div>
        <Link className={styles.button} href="/app/campanas/nueva">
          <Plus aria-hidden="true" size={18} />
          Nueva campaña
        </Link>
      </header>

      <section className={styles.wideCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Portafolio</p>
            <h2>{state.campaigns.length} campañas</h2>
          </div>
          <Megaphone aria-hidden="true" size={22} />
        </div>

        <div className={styles.list}>
          {state.campaigns.map((campaign) => {
            const event = state.events.find((item) => item.id === campaign.eventId);
            return (
              <article className={styles.row} key={campaign.id}>
                <div className={styles.rowTitle}>
                  <strong>{campaign.name}</strong>
                  <span className={styles.muted}>{campaign.objective}</span>
                </div>
                <div>
                  <strong>{event?.name ?? "Campaña de marca"}</strong>
                  <div className={styles.muted}>{campaign.creativeConcept}</div>
                </div>
                <span
                  className={
                    campaign.status === "active"
                      ? `${styles.badge} ${styles.badgeApproved}`
                      : styles.badge
                  }
                >
                  {formatStatus(campaign.status)}
                </span>
                <span className={styles.muted}>
                  {campaign.budgetAmount
                    ? new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: campaign.budgetCurrency,
                        maximumFractionDigits: 0,
                      }).format(campaign.budgetAmount)
                    : "Sin presupuesto"}
                </span>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
