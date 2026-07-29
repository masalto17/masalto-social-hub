"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type { CampaignStatus } from "@/lib/workspace-model";
import styles from "../../workspace.module.css";

export default function NewCampaignPage() {
  const router = useRouter();
  const { state, createCampaign } = useWorkspace();
  const [dateError, setDateError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const eventId = String(form.get("eventId"));
    const budgetValue = String(form.get("budgetAmount")).trim();
    const startsAt = new Date(String(form.get("startsAt")));
    const endsAt = new Date(String(form.get("endsAt")));

    if (endsAt <= startsAt) {
      setDateError("El cierre debe ser posterior al inicio de la campaña.");
      return;
    }

    setDateError("");

    createCampaign({
      eventId: eventId || null,
      name: String(form.get("name")).trim(),
      objective: String(form.get("objective")).trim(),
      audience: String(form.get("audience")).trim(),
      creativeConcept: String(form.get("creativeConcept")).trim(),
      budgetAmount: budgetValue ? Number(budgetValue) : null,
      budgetCurrency: "ARS",
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: String(form.get("status")) as CampaignStatus,
    });

    router.push("/app/campanas");
  };

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Campañas</p>
          <h1>Nueva campaña</h1>
        </div>
        <Link className={styles.buttonSecondary} href="/app/campanas">
          <ArrowLeft aria-hidden="true" size={18} />
          Volver
        </Link>
      </header>

      <section className={styles.wideCard}>
        <form className={styles.form} onSubmit={submit}>
          {dateError ? (
            <p className={styles.error} role="alert">
              {dateError}
            </p>
          ) : null}
          <div className={styles.formGrid}>
            <div className={styles.fieldWide}>
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" required maxLength={120} />
            </div>

            <div className={styles.field}>
              <label htmlFor="eventId">Evento asociado</label>
              <select id="eventId" name="eventId" defaultValue="">
                <option value="">Campaña de marca</option>
                {state.events.map((event) => (
                  <option value={event.id} key={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="status">Estado inicial</label>
              <select id="status" name="status" defaultValue="draft">
                <option value="draft">Borrador</option>
                <option value="planned">Planificada</option>
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
              </select>
            </div>

            <div className={styles.fieldWide}>
              <label htmlFor="objective">Objetivo</label>
              <input
                id="objective"
                name="objective"
                placeholder="Ej.: venta de entradas"
                required
                maxLength={160}
              />
            </div>

            <div className={styles.fieldWide}>
              <label htmlFor="audience">Público</label>
              <textarea id="audience" name="audience" required maxLength={600} />
            </div>

            <div className={styles.fieldWide}>
              <label htmlFor="creativeConcept">Concepto creativo</label>
              <input
                id="creativeConcept"
                name="creativeConcept"
                required
                maxLength={180}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="startsAt">Inicio</label>
              <input id="startsAt" name="startsAt" type="datetime-local" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="endsAt">Cierre</label>
              <input id="endsAt" name="endsAt" type="datetime-local" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="budgetAmount">Presupuesto estimado (ARS)</label>
              <input
                id="budgetAmount"
                name="budgetAmount"
                type="number"
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className={styles.formFooter}>
            <Link className={styles.buttonSecondary} href="/app/campanas">
              Cancelar
            </Link>
            <button className={styles.button} type="submit">
              <Save aria-hidden="true" size={18} />
              Guardar campaña
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
