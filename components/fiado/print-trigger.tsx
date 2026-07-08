"use client"

import { useEffect } from "react"

export function PrintTrigger() {
  useEffect(() => {
    const timeout = setTimeout(() => window.print(), 300)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="mb-4 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md border border-gray-400 px-3 py-1 text-sm"
      >
        Imprimir
      </button>
    </div>
  )
}
