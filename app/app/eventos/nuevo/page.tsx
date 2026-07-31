"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type {
  EventEcosystemMode,
  SaleStatus,
  WebsiteStatus,
} from "@/lib/workspace-model";
import styles from "../../workspace.module.css";

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent } = useWorkspace();
  const [ecosystemMode, setEcosystemMode] =
    useState<EventEcosystemMode>("independent");
  const [ticketProvider, setTicketProvider] = useState<
    "entradaweb" | "accred" | "external" | "physical" | "none"
  >("entradaweb");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startsAt = String(form.get("startsAt"));
    const capacityValue = String(form.get("capacity")).trim();
    const externalTicketUrl = String(form.get("externalTicketUrl")).trim();

    createEvent({
      name: String(form.get("name")).trim(),
      startsAt: new Date(startsAt).toISOString(),
      venueName: String(form.get("venueName")).trim(),
      city: String(form.get("city")).trim(),
      capacity: capacityValue ? Number(capacityValue) : null,
      ecosystemMode,
      websiteStatus: String(form.get("websiteStatus")) as WebsiteStatus,
      saleStatus: String(form.get("saleStatus")) as SaleStatus,
      ticketingProvider: ticketProvider,
      externalTicketUrl:
        ticketProvider === "entradaweb" || ticketProvider === "external"
          ? externalTicketUrl || null
          : null,
    });

    router.push("/app/eventos");
  };

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Eventos</p>
          <h1>Nuevo evento</h1>
        </div>
        <Link className={styles.buttonSecondary} href="/app/eventos">
          <ArrowLeft aria-hidden="true" size={18} />
          Volver
        </Link>
      </header>

      <p className={styles.notice}>
        Crear un evento no lo publica. Todo evento nace como borrador y Accred permanece
        apagado aunque se seleccione como modo futuro.
      </p>

      <section className={styles.wideCard}>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formGrid}>
            <div className={styles.fieldWide}>
              <label htmlFor="name">Nombre público</label>
              <input id="name" name="name" required maxLength={120} />
            </div>

            <div className={styles.field}>
              <label htmlFor="startsAt">Fecha y hora</label>
              <input id="startsAt" name="startsAt" type="datetime-local" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="capacity">Capacidad</label>
              <input id="capacity" name="capacity" type="number" min="1" step="1" />
            </div>

            <div className={styles.field}>
              <label htmlFor="venueName">Lugar</label>
              <input id="venueName" name="venueName" required maxLength={120} />
            </div>

            <div className={styles.field}>
              <label htmlFor="city">Ciudad</label>
              <input id="city" name="city" defaultValue="San Juan" required maxLength={80} />
            </div>

            <div className={styles.field}>
              <label htmlFor="ecosystemMode">Modo de ecosistema</label>
              <select
                id="ecosystemMode"
                name="ecosystemMode"
                value={ecosystemMode}
                onChange={(change) =>
                  setEcosystemMode(change.target.value as EventEcosystemMode)
                }
              >
                <option value="independent">Independiente</option>
                <option value="accred">Preparado para Accred</option>
              </select>
              <small>La integración real seguirá desactivada.</small>
            </div>

            <div className={styles.field}>
              <label htmlFor="ticketProvider">Entradas</label>
              <select
                id="ticketProvider"
                name="ticketProvider"
                value={ticketProvider}
                onChange={(change) =>
                  setTicketProvider(
                    change.target.value as
                      | "entradaweb"
                      | "accred"
                      | "external"
                      | "physical"
                      | "none",
                  )
                }
              >
                <option value="entradaweb">EntradaWeb</option>
                <option value="external">Ticketera externa</option>
                <option value="physical">Venta física</option>
                <option value="none">Sin entradas</option>
                <option value="accred">Accred futuro</option>
              </select>
            </div>

            {(ticketProvider === "entradaweb" || ticketProvider === "external") && (
              <div className={styles.fieldWide}>
                <label htmlFor="externalTicketUrl">Enlace de compra</label>
                <input
                  id="externalTicketUrl"
                  name="externalTicketUrl"
                  type="url"
                  placeholder="https://"
                />
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="saleStatus">Estado de venta</label>
              <select id="saleStatus" name="saleStatus" defaultValue="coming_soon">
                <option value="coming_soon">Próximamente</option>
                <option value="presale">Preventa</option>
                <option value="available">Disponible</option>
                <option value="last_tickets">Últimas entradas</option>
                <option value="sold_out">Agotado</option>
                <option value="rescheduled">Reprogramado</option>
                <option value="cancelled">Cancelado</option>
                <option value="finished">Finalizado</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="websiteStatus">Visibilidad web</label>
              <select id="websiteStatus" name="websiteStatus" defaultValue="draft">
                <option value="draft">Borrador</option>
                <option value="scheduled">Programado</option>
                <option value="published">Publicado</option>
                <option value="private_link">Enlace privado</option>
                <option value="hidden">No publicar</option>
              </select>
              <small>En el prototipo nunca publica automáticamente.</small>
            </div>
          </div>

          <div className={styles.formFooter}>
            <Link className={styles.buttonSecondary} href="/app/eventos">
              Cancelar
            </Link>
            <button className={styles.button} type="submit">
              <Save aria-hidden="true" size={18} />
              Guardar borrador
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
