"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RestockDialog } from "@/components/stock/restock-dialog"

export function ProductRestockButton({
  product,
  responsibleName,
}: {
  product: { id: string; name: string; stock: number }
  responsibleName: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Reabastecer</Button>
      <RestockDialog
        open={open}
        onOpenChange={setOpen}
        products={[product]}
        initialProductId={product.id}
        responsibleName={responsibleName}
      />
    </>
  )
}
