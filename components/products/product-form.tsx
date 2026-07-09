"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { PRODUCT_CATEGORIES, PRODUCT_TYPE_LABELS } from "@/lib/constants"
import { brlToCents } from "@/lib/money"
import type { Product } from "@/lib/generated/prisma/client"

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isEdit = !!product
  const [submitting, setSubmitting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    product?.photoUrl ?? null
  )
  const [productType, setProductType] = useState(product?.productType ?? "SIMPLE")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const payload = {
        name: String(form.get("name") ?? ""),
        category: String(form.get("category") ?? ""),
        productType,
        volumeMl: productType === "FRACTIONAL" ? Number(form.get("volumeMl") ?? 0) : undefined,
        fullBottleSalePrice:
          productType === "FRACTIONAL" && form.get("fullBottleSalePrice")
            ? brlToCents(String(form.get("fullBottleSalePrice")))
            : undefined,
        defaultDoseMl:
          productType === "FRACTIONAL" ? Number(form.get("defaultDoseMl") ?? 0) : undefined,
        purchasePrice: brlToCents(String(form.get("purchasePrice") ?? "0")),
        salePrice: brlToCents(String(form.get("salePrice") ?? "0")),
        code: String(form.get("code") ?? ""),
        barcode: String(form.get("barcode") ?? ""),
        description: String(form.get("description") ?? ""),
        // Estoque atual only travels in the payload when creating — once a
        // product exists, stock only changes via Reabastecer/PDV/movimentações,
        // never a direct edit here.
        ...(isEdit ? {} : { stock: Number(form.get("stock") ?? 0) }),
        minStock: Number(form.get("minStock") ?? 0),
        supplier: String(form.get("supplier") ?? ""),
        active: form.get("active") === "on",
      }

      const url = isEdit ? `/api/products/${product.id}` : "/api/products"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Erro ao salvar produto")
        return
      }

      if (photoFile) {
        const photoForm = new FormData()
        photoForm.append("file", photoFile)
        const photoRes = await fetch(`/api/products/${data.id}/upload-photo`, {
          method: "POST",
          body: photoForm,
        })
        if (!photoRes.ok) {
          const photoErr = await photoRes.json()
          toast.error(photoErr.error ?? "Produto salvo, mas falhou o envio da foto")
        }
      }

      toast.success(isEdit ? "Produto atualizado" : "Produto criado")
      router.push("/produtos")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={product?.name} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select name="category" defaultValue={product?.category} required>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="productType">Tipo do Produto</Label>
            <Select
              value={productType}
              onValueChange={(v) => v && setProductType(v as "SIMPLE" | "FRACTIONAL")}
              items={PRODUCT_TYPE_LABELS}
              required
            >
              <SelectTrigger id="productType" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input id="supplier" name="supplier" defaultValue={product?.supplier ?? ""} />
          </div>

          {productType === "FRACTIONAL" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="volumeMl">Volume da garrafa/unidade (ml)</Label>
                <Input
                  id="volumeMl"
                  name="volumeMl"
                  type="number"
                  min={1}
                  defaultValue={product?.volumeMl ?? ""}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullBottleSalePrice">
                  Preço da unidade inteira (R$, opcional)
                </Label>
                <Input
                  id="fullBottleSalePrice"
                  name="fullBottleSalePrice"
                  inputMode="decimal"
                  placeholder="0,00 (deixe vazio p/ não vender inteira)"
                  defaultValue={
                    product?.fullBottleSalePrice
                      ? (product.fullBottleSalePrice / 100).toFixed(2).replace(".", ",")
                      : ""
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="defaultDoseMl">Dose padrão (ml)</Label>
                <Input
                  id="defaultDoseMl"
                  name="defaultDoseMl"
                  type="number"
                  min={1}
                  defaultValue={product?.defaultDoseMl ?? ""}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Usada só para estimar &quot;doses restantes&quot; no Estoque/Dashboard.
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="purchasePrice">Preço de compra (R$)</Label>
            <Input
              id="purchasePrice"
              name="purchasePrice"
              inputMode="decimal"
              defaultValue={
                product ? (product.purchasePrice / 100).toFixed(2).replace(".", ",") : ""
              }
              placeholder="0,00"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="salePrice">Preço de venda (R$)</Label>
            <Input
              id="salePrice"
              name="salePrice"
              inputMode="decimal"
              defaultValue={
                product ? (product.salePrice / 100).toFixed(2).replace(".", ",") : ""
              }
              placeholder="0,00"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="stock">Estoque atual</Label>
            {isEdit ? (
              <>
                <Input id="stock" value={product.stock} disabled />
                <p className="text-xs text-muted-foreground">
                  Não editável aqui —{" "}
                  <Link href="/estoque" className="underline">
                    use Reabastecer Estoque
                  </Link>{" "}
                  para alterar.
                </p>
              </>
            ) : (
              <Input id="stock" name="stock" type="number" min={0} defaultValue={0} required />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="minStock">Estoque mínimo</Label>
            <Input
              id="minStock"
              name="minStock"
              type="number"
              min={0}
              defaultValue={product?.minStock ?? 0}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Código</Label>
            <Input id="code" name="code" defaultValue={product?.code ?? ""} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="barcode">Código de barras</Label>
            <Input id="barcode" name="barcode" defaultValue={product?.barcode ?? ""} />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="photo">Foto</Label>
            {photoPreview && (
              <Image
                src={photoPreview}
                alt="Foto do produto"
                width={96}
                height={96}
                className="size-24 rounded-md border object-cover"
                unoptimized
              />
            )}
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setPhotoFile(file)
                if (file) setPhotoPreview(URL.createObjectURL(file))
              }}
            />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox id="active" name="active" defaultChecked={product?.active ?? true} />
            <Label htmlFor="active">Produto ativo</Label>
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar produto"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/produtos")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
