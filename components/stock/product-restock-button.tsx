"use client"

import { useState } from "react"
import { PackagePlus } from "lucide-react"
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
      <Button className="h-10 rounded-xl px-4" onClick={() => setOpen(true)}>
        <PackagePlus className="size-4" />
        Reabastecer
      </Button>
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
