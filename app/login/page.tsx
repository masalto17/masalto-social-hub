import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAuthMode } from "@/lib/supabase/auth-mode";
import { signIn } from "./actions";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Acceso | MasAlto Social Hub",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const configured = getAuthMode() === "configured";

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
        <h1>Acceso privado</h1>

        {!configured ? (
          <p className={styles.error}>
            La autenticación todavía no está configurada en este ambiente.
          </p>
        ) : (
          <form className={styles.form} action={signIn}>
            {error ? (
              <p className={styles.error} role="alert">
                {error === "missing"
                  ? "Completá email y contraseña."
                  : "No pudimos validar esas credenciales."}
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
            <div className={styles.field}>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={12}
              />
            </div>
            <button className={styles.button} type="submit">
              Ingresar
            </button>
          </form>
        )}

        <Link className={styles.back} href="/">
          Volver a eventos
        </Link>
      </section>
    </main>
  );
}
