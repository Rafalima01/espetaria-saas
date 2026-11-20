"use client"

import { useEffect } from "react"

// Registra o service worker só em produção. No desenvolvimento ele atrapalha
// (guarda coisas velhas), então qualquer um que sobrou é removido.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((r) => r.unregister())
      })
      return
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sem service worker o sistema funciona igual, só sem a tela de "sem conexão".
    })
  }, [])

  return null
}
