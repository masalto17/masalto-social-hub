import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requestPasswordReset } from "./actions";
import styles from "../login/login.module.css";

export const metadata: Metadata = {
  title: "Recuperar contraseña | MasAlto Social Hub",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <Image
          className={styles.logo}
          src="/brand/masalto-producciones.trimmed.png"
          alt="MásAlto Producciones"
          width={190}
          height={92}
          priority
        />
        <p className={styles.eyebrow}>Social Hub</p>
        <h1>Recuperar contraseña</h1>

        {sent ? (
          <p role="status">
            Revisá tu correo. El enlace te permitirá definir una contraseña nueva.
          </p>
        ) : (
          <form className={styles.form} action={requestPasswordReset}>
            {error ? (
              <p className={styles.error} role="alert">
                {error === "missing"
                  ? "Ingresá tu email."
                  : "No pudimos enviar el correo. Intentá nuevamente."}
              </p>
            ) : null}
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </div>
            <button className={styles.button} type="submit">
              Enviar enlace
            </button>
          </form>
        )}

        <Link className={styles.back} href="/login">
          Volver al acceso
        </Link>
      </section>
    </main>
  );
}
