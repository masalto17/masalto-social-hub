"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type {
  ContentStatus,
  SocialChannel,
} from "@/lib/workspace-model";
import styles from "../../workspace.module.css";

const channels: Array<{ value: SocialChannel; label: string }> = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "web", label: "MasAlto.com.ar" },
];

export default function NewContentPage() {
  const router = useRouter();
  const { state, createContent } = useWorkspace();
  const [selectedChannels, setSelectedChannels] = useState<SocialChannel[]>([
    "instagram",
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
    setError("");
    createContent({
      campaignId: String(form.get("campaignId")),
      title: String(form.get("title")).trim(),
      baseCopy: String(form.get("baseCopy")).trim(),
      format: String(form.get("format")),
      status: String(form.get("status")) as ContentStatus,
      channels: selectedChannels,
      scheduledAt: new Date(String(form.get("scheduledAt"))).toISOString(),
    });
    router.push("/app/contenido");
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
          <p className={styles.eyebrow}>Biblioteca</p>
          <h1>Nueva pieza</h1>
        </div>
        <Link className={styles.buttonSecondary} href="/app/contenido">
          <ArrowLeft aria-hidden="true" size={18} />
          Volver
        </Link>
      </header>

      <p className={styles.notice}>
        La fecha queda preparada dentro del calendario. No se publicará hasta que la
        pieza sea aprobada expresamente.
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
              <label htmlFor="status">Estado inicial</label>
              <select id="status" name="status" defaultValue="draft">
                <option value="draft">Borrador</option>
                <option value="in_review">En revisión</option>
              </select>
            </div>

            <div className={styles.fieldWide}>
              <label htmlFor="title">Título interno</label>
              <input id="title" name="title" required maxLength={160} />
            </div>

            <div className={styles.fieldWide}>
              <label htmlFor="baseCopy">Copy base</label>
              <textarea id="baseCopy" name="baseCopy" required maxLength={2200} />
            </div>

            <div className={styles.field}>
              <label htmlFor="format">Formato maestro</label>
              <select id="format" name="format" defaultValue="Feed 4:5">
                <option>Feed 4:5</option>
                <option>Historia / Reel 9:16</option>
                <option>Cuadrado 1:1</option>
                <option>Horizontal 16:9</option>
                <option>Texto</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="scheduledAt">Fecha prevista</label>
              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                required
              />
            </div>

            <fieldset className={styles.fieldWide}>
              <legend>Canales</legend>
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
            <Link className={styles.buttonSecondary} href="/app/contenido">
              Cancelar
            </Link>
            <button className={styles.button} type="submit">
              <Save aria-hidden="true" size={18} />
              Guardar pieza
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
