"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CatalogSearch } from "@/components/pdv/catalog-search"
import { Cart } from "@/components/pdv/cart"
import { PaymentSplitDialog, type PaymentRow } from "@/components/pdv/payment-split-dialog"
import { useCart } from "@/lib/pdv/use-cart"
import { brlToCents } from "@/lib/money"
import type { Product } from "@/lib/generated/prisma/client"

type ProductWithDoses = Product & {
  dosePrices: { doseSizeId: string; salePrice: number; doseSize: { id: string; volumeMl: number } }[]
}

type RecipeWithCup = {
  id: string
  name: string
  salePrice: number
  cupProduct: { name: string } | null
}

export function PdvClient({
  products,
  recipes,
}: {
  products: ProductWithDoses[]
  recipes: RecipeWithCup[]
}) {
  const router = useRouter()
  const { state, dispatch, subtotal, total } = useCart()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirmPayment(
    payments: PaymentRow[],
    creditCustomerId?: string
  ) {
    setSubmitting(true)
    try {
      const items = state.lines
        .filter((l) => l.kind === "product")
        .map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          discount: l.discount,
          surcharge: 0,
          note: l.note,
        }))
      const doseItems = state.lines
        .filter((l) => l.kind === "dose")
        .map((l) => ({
          productId: l.productId,
          doseSizeId: l.doseSizeId,
          mode: l.mode,
          quantity: l.quantity,
          discount: l.discount,
          note: l.note,
        }))
      const recipeItems = state.lines
        .filter((l) => l.kind === "recipe")
        .map((l) => ({
          recipeId: l.recipeId,
          quantity: l.quantity,
          discount: l.discount,
          note: l.note,
        }))

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          doseItems,
          recipeItems,
          discount: state.saleDiscount,
          surcharge: state.saleSurcharge,
          payments,
          creditCustomerId,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao finalizar venda")
        return
      }

      toast.success("Venda finalizada com sucesso")
      for (const w of data.lowStockWarnings ?? []) {
        toast.warning(
          `⚠️ O produto "${w.name}" atingiu o estoque ${w.status === "CRITICAL" ? "crítico" : "baixo"}. Estoque atual: ${w.stock}, mínimo: ${w.minStock}`,
        )
      }
      dispatch({ type: "CLEAR" })
      setPaymentOpen(false)
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-stretch">
      <CatalogSearch
        products={products}
        recipes={recipes}
        onAddProduct={(product) => dispatch({ type: "ADD_PRODUCT", product })}
        onAddDose={(dose) => dispatch({ type: "ADD_DOSE", dose })}
        onAddRecipe={(recipe) => dispatch({ type: "ADD_RECIPE", recipe })}
      />
      <Cart
        lines={state.lines}
        saleDiscount={state.saleDiscount}
        saleSurcharge={state.saleSurcharge}
        subtotal={subtotal}
        total={total}
        onQtyChange={(key, quantity) => dispatch({ type: "SET_QTY", key, quantity })}
        onNoteChange={(key, note) => dispatch({ type: "SET_NOTE", key, note })}
        onLineDiscountChange={(key, discountBRL) =>
          dispatch({ type: "SET_DISCOUNT", key, discount: brlToCents(discountBRL) })
        }
        onRemove={(key) => dispatch({ type: "REMOVE_LINE", key })}
        onSaleDiscountChange={(discountBRL) =>
          dispatch({ type: "SET_SALE_DISCOUNT", discount: brlToCents(discountBRL) })
        }
        onSaleSurchargeChange={(surchargeBRL) =>
          dispatch({ type: "SET_SALE_SURCHARGE", surcharge: brlToCents(surchargeBRL) })
        }
        onFinalize={() => setPaymentOpen(true)}
      />
      <PaymentSplitDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={total}
        onConfirm={handleConfirmPayment}
        submitting={submitting}
      />
    </div>
  )
}
