import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MasAlto Social Hub",
    short_name: "Social Hub",
    description:
      "Gestión de campañas, contenidos y eventos de MasAlto Producciones.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f6f6f4",
    theme_color: "#e30613",
    icons: [
      {
        src: "/brand/masalto-producciones.trimmed.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
