import type { Metadata } from "next";
import Image from "next/image";
import { SetPasswordForm } from "./set-password-form";
import styles from "../login/login.module.css";

export const metadata: Metadata = {
  title: "Definir contraseña | MasAlto Social Hub",
  robots: { index: false, follow: false },
};

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
        <h1>Definir contraseña</h1>

        <SetPasswordForm error={error} />
      </section>
    </main>
  );
}
