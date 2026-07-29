"use client";

import { FileSpreadsheet, ShieldCheck, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { summarizeEntradaWebSales } from "@/lib/entradaweb-sales";
import styles from "../workspace.module.css";

export default function SalesPage() {
  const { state, importSales } = useWorkspace();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const latest = [...state.salesSnapshots].sort((a, b) =>
    b.importedAt.localeCompare(a.importedAt),
  )[0];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setMessage("");
    const form = new FormData(formElement);
    const eventId = String(form.get("eventId"));
    const file = form.get("report");

    if (!(file instanceof File) || file.size === 0) {
      setError("Seleccioná el reporte Excel de EntradaWeb.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("El reporte debe estar en formato .xlsx.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo supera el límite de 5 MB.");
      return;
    }

    try {
      const { readSheet } = await import("read-excel-file/browser");
      const rows = await readSheet(file);
      const summary = summarizeEntradaWebSales(rows);
      importSales({ eventId, ...summary });
      setMessage(
        `${summary.totalTickets} entradas importadas. El archivo y los datos personales fueron descartados.`,
      );
      formElement.reset();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo leer el reporte de EntradaWeb.",
      );
    }
  };

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>EntradaWeb</p>
          <h1>Resumen de ventas</h1>
        </div>
      </header>

      <p className={styles.notice}>
        El procesamiento ocurre en este navegador. Social Hub conserva sólo totales
        agregados y descarta nombres, email, teléfono y DNI.
      </p>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className={styles.notice}>{message}</p> : null}

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Importar</p>
              <h2>Reporte de compradores web</h2>
            </div>
            <Upload aria-hidden="true" size={22} />
          </div>

          <form className={styles.form} onSubmit={submit}>
            <div className={styles.field}>
              <label htmlFor="eventId">Evento</label>
              <select id="eventId" name="eventId" required>
                {state.events.map((event) => (
                  <option value={event.id} key={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="report">Archivo .xlsx</label>
              <input
                id="report"
                name="report"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                required
              />
            </div>
            <button className={styles.button} type="submit">
              <FileSpreadsheet aria-hidden="true" size={18} />
              Procesar reporte
            </button>
          </form>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Último resumen</p>
              <h2>{latest ? `${latest.totalTickets} entradas` : "Sin importaciones"}</h2>
            </div>
            <ShieldCheck aria-hidden="true" size={22} />
          </div>

          {latest ? (
            <dl className={styles.summaryList}>
              <div>
                <dt>Compradores</dt>
                <dd>{latest.buyerRows}</dd>
              </div>
              <div>
                <dt>Filas descartadas</dt>
                <dd>{latest.rejectedRows}</dd>
              </div>
              <div>
                <dt>Fuente</dt>
                <dd>EntradaWeb</dd>
              </div>
            </dl>
          ) : (
            <p className={styles.muted}>
              El primer reporte agregado aparecerá acá.
            </p>
          )}
        </article>
      </section>
    </>
  );
}
