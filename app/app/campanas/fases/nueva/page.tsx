"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type {
  CampaignPhaseType,
  SocialChannel,
} from "@/lib/workspace-model";
import styles from "../../../workspace.module.css";

const phaseTypes: Array<{ value: CampaignPhaseType; label: string }> = [
  { value: "intrigue", label: "Intriga" },
  { value: "announcement", label: "Anuncio" },
  { value: "desire", label: "Deseo" },
  { value: "conversion", label: "Conversión" },
  { value: "urgency", label: "Urgencia" },
  { value: "custom", label: "Personalizada" },
];

const channels: Array<{ value: SocialChannel; label: string }> = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "web", label: "MasAlto.com.ar" },
];

export default function NewCampaignPhasePage() {
  const router = useRouter();
  const { state, createCampaignPhase } = useWorkspace();
  const [selectedChannels, setSelectedChannels] = useState<SocialChannel[]>([
    "instagram",
    "facebook",
  ]);
  const [error, setError] = useState("");

  const toggleChannel = (channel: SocialChannel) => {
    setSelectedChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedChannels.length === 0) {
      setError("Seleccioná al menos un canal.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const campaignId = String(form.get("campaignId"));
    const startsAt = new Date(String(form.get("startsAt")));
    const endsAt = new Date(String(form.get("endsAt")));
    const created = createCampaignPhase({
      campaignId,
      type: String(form.get("type")) as CampaignPhaseType,
      name: String(form.get("name")).trim(),
      objective: String(form.get("objective")).trim(),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      channels: selectedChannels,
    });

    if (!created) {
      setError(
        "La fase debe tener fechas válidas y quedar completamente dentro de la campaña.",
      );
      return;
    }

    router.push("/app/campanas");
  };

  if (state.campaigns.length === 0) {
    return (
      <section className={styles.empty}>
        Primero necesitás una campaña.
        <br />
        <Link href="/app/campanas/nueva">Crear campaña</Link>
      </section>
    );
  }

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Planificación</p>
          <h1>Nueva fase</h1>
        </div>
        <Link className={styles.buttonSecondary} href="/app/campanas">
          <ArrowLeft aria-hidden="true" size={18} />
          Volver
        </Link>
      </header>

      <p className={styles.notice}>
        La fase organiza objetivos, fechas y canales. No programa publicaciones por sí
        sola.
      </p>

      <section className={styles.wideCard}>
        <form className={styles.form} onSubmit={submit}>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="campaignId">Campaña</label>
              <select id="campaignId" name="campaignId" required>
                {state.campaigns.map((campaign) => (
                  <option value={campaign.id} key={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="type">Tipo</label>
              <select id="type" name="type" defaultValue="intrigue">
                {phaseTypes.map((phase) => (
                  <option value={phase.value} key={phase.value}>
                    {phase.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldWide}>
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" required maxLength={120} />
            </div>

            <div className={styles.fieldWide}>
              <label htmlFor="objective">Objetivo de la fase</label>
              <textarea id="objective" name="objective" required maxLength={600} />
            </div>

            <div className={styles.field}>
              <label htmlFor="startsAt">Inicio</label>
              <input id="startsAt" name="startsAt" type="datetime-local" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="endsAt">Cierre</label>
              <input id="endsAt" name="endsAt" type="datetime-local" required />
            </div>

            <fieldset className={styles.fieldWide}>
              <legend>Canales previstos</legend>
              <div className={styles.checkboxGrid}>
                {channels.map((channel) => (
                  <label className={styles.checkbox} key={channel.value}>
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel.value)}
                      onChange={() => toggleChannel(channel.value)}
                    />
                    <span>{channel.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className={styles.formFooter}>
            <Link className={styles.buttonSecondary} href="/app/campanas">
              Cancelar
            </Link>
            <button className={styles.button} type="submit">
              <Save aria-hidden="true" size={18} />
              Guardar fase
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
