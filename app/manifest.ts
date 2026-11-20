import type { MetadataRoute } from "next"

// Permite instalar o sistema na tela inicial do celular ou do computador,
// abrindo em tela cheia, como um aplicativo.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JP Espeto Bar",
    short_name: "JP Espeto",
    description: "Sistema de gestão do JP Espeto Bar: PDV, estoque, doses, fiado e financeiro",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#1A141A",
    theme_color: "#1A141A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Nova venda", short_name: "PDV", url: "/pdv", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Estoque", url: "/estoque", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Fiado", url: "/fiado", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  }
}
