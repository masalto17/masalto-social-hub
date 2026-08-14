"use client";

import { useEffect, useState } from "react";
import { setPassword } from "./actions";
import styles from "../login/login.module.css";

const errorMessages: Record<string, string> = {
  length: "La contraseña debe tener al menos 12 caracteres.",
  mismatch: "Las contraseñas no coinciden.",
  update: "No pudimos guardar la contraseña. Solicitá un enlace nuevo.",
};

export function SetPasswordForm({ error }: { error?: string }) {
  const [linkState, setLinkState] = useState<"checking" | "ready" | "error">(
    "checking",
  );

  useEffect(() => {
    async function restoreSession() {
      await Promise.resolve();

      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");

      if (fragment.get("error")) {
        setLinkState("error");
        return;
      }

      if (!accessToken && !refreshToken) {
        setLinkState("ready");
        return;
      }

      if (!accessToken || !refreshToken) {
        setLinkState("error");
        return;
      }

      const response = await fetch("/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken }),
      }).catch(() => null);
      if (!response?.ok) {
        setLinkState("error");
        return;
      }

      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}${window.location.search}`,
      );
      setLinkState("ready");
    }

    void restoreSession();
  }, []);

  const visibleError =
    linkState === "error"
      ? "El enlace venció o no es válido. Solicitá uno nuevo."
      : error
        ? (errorMessages[error] ?? errorMessages.update)
        : null;

  return (
    <form className={styles.form} action={setPassword}>
      {visibleError ? (
        <p className={styles.error} role="alert">
          {visibleError}
        </p>
      ) : null}
      <div className={styles.field}>
        <label htmlFor="password">Nueva contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="confirmation">Repetir contraseña</label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </div>
      <button
        className={styles.button}
        type="submit"
        disabled={linkState !== "ready"}
      >
        {linkState === "checking" ? "Validando enlace" : "Guardar y entrar"}
      </button>
    </form>
  );
}
