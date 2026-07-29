import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "../login/login.module.css";

export const metadata: Metadata = {
  title: "Acceso no disponible | MasAlto Social Hub",
  robots: { index: false, follow: false },
};

export default function AccessRequiredPage() {
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
        <h1>Panel no habilitado</h1>
        <p>
          El acceso interno permanece cerrado hasta completar la configuración
          segura de autenticación.
        </p>
        <Link className={styles.back} href="/">
          Volver a eventos
        </Link>
      </section>
    </main>
  );
}
