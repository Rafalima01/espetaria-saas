"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ImagePlus } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PRODUCT_CATEGORIES, PRODUCT_TYPE_LABELS } from "@/lib/constants"
import { brlToCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/generated/prisma/client"

const FIELD_INPUT = "h-10 rounded-xl bg-background"

function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">{children}</CardContent>
    </Card>
  )
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isEdit = !!product
  const [submitting, setSubmitting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    product?.photoUrl ?? null
  )
  const [productType, setProductType] = useState(product?.productType ?? "SIMPLE")
  const [purchaseText, setPurchaseText] = useState(
    product ? (product.purchasePrice / 100).toFixed(2).replace(".", ",") : ""
  )
  const [saleText, setSaleText] = useState(
    product ? (product.salePrice / 100).toFixed(2).replace(".", ",") : ""
  )
  const purchaseCents = brlToCents(purchaseText || "0")
  const saleCents = brlToCents(saleText || "0")
  const marginPct =
    productType === "SIMPLE" && saleCents > 0
      ? Math.round(((saleCents - purchaseCents) / saleCents) * 100)
      : null

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
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Section title="Informações básicas" description="Como o produto aparece no PDV e nos relatórios">
          <Field label="Nome" htmlFor="name" className="sm:col-span-2">
            <Input id="name" name="name" className={FIELD_INPUT} defaultValue={product?.name} required />
          </Field>

          <Field label="Categoria" htmlFor="category">
            <Select name="category" defaultValue={product?.category} required>
              <SelectTrigger id="category" className="h-10 w-full rounded-xl">
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
          </Field>

          <Field label="Tipo do produto" htmlFor="productType">
            <Select
              value={productType}
              onValueChange={(v) => v && setProductType(v as "SIMPLE" | "FRACTIONAL")}
              items={PRODUCT_TYPE_LABELS}
              required
            >
              <SelectTrigger id="productType" className="h-10 w-full rounded-xl">
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
          </Field>

          <Field label="Fornecedor" htmlFor="supplier">
            <Input id="supplier" name="supplier" className={FIELD_INPUT} defaultValue={product?.supplier ?? ""} />
          </Field>

          <Field label="Código" htmlFor="code">
            <Input id="code" name="code" className={FIELD_INPUT} defaultValue={product?.code ?? ""} />
          </Field>

          <Field label="Código de barras" htmlFor="barcode" className="sm:col-span-2">
            <Input id="barcode" name="barcode" className={FIELD_INPUT} defaultValue={product?.barcode ?? ""} />
          </Field>

          <Field label="Descrição" htmlFor="description" className="sm:col-span-2">
            <Textarea
              id="description"
              name="description"
              className="min-h-24 rounded-xl bg-background"
              defaultValue={product?.description ?? ""}
            />
          </Field>
        </Section>

        {productType === "FRACTIONAL" && (
          <Section
            title="Bebida fracionada"
            description="Controle em ml: cada garrafa aberta vira uma unidade rastreável"
          >
            <Field label="Volume da garrafa/unidade (ml)" htmlFor="volumeMl">
              <Input
                id="volumeMl"
                name="volumeMl"
                type="number"
                min={1}
                className={FIELD_INPUT}
                defaultValue={product?.volumeMl ?? ""}
                required
              />
            </Field>
            <Field label="Preço da unidade inteira (R$, opcional)" htmlFor="fullBottleSalePrice">
              <Input
                id="fullBottleSalePrice"
                name="fullBottleSalePrice"
                inputMode="decimal"
                className={FIELD_INPUT}
                placeholder="0,00 (vazio = não vende inteira)"
                defaultValue={
                  product?.fullBottleSalePrice
                    ? (product.fullBottleSalePrice / 100).toFixed(2).replace(".", ",")
                    : ""
                }
              />
            </Field>
            <Field
              label="Dose padrão (ml)"
              htmlFor="defaultDoseMl"
              hint='Usada só para estimar "doses restantes" no Estoque e no Dashboard.'
            >
              <Input
                id="defaultDoseMl"
                name="defaultDoseMl"
                type="number"
                min={1}
                className={FIELD_INPUT}
                defaultValue={product?.defaultDoseMl ?? ""}
                required
              />
            </Field>
          </Section>
        )}

        <Section title="Preços e estoque">
          <Field label="Preço de compra (R$)" htmlFor="purchasePrice">
            <Input
              id="purchasePrice"
              name="purchasePrice"
              inputMode="decimal"
              className={FIELD_INPUT}
              value={purchaseText}
              onChange={(e) => setPurchaseText(e.target.value)}
              placeholder="0,00"
              required
            />
          </Field>

          <Field
            label="Preço de venda (R$)"
            htmlFor="salePrice"
            hint={
              marginPct !== null ? (
                <span className={marginPct < 0 ? "text-destructive" : "text-primary"}>
                  Margem de {marginPct}% por unidade
                </span>
              ) : undefined
            }
          >
            <Input
              id="salePrice"
              name="salePrice"
              inputMode="decimal"
              className={FIELD_INPUT}
              value={saleText}
              onChange={(e) => setSaleText(e.target.value)}
              placeholder="0,00"
              required
            />
          </Field>

          <Field
            label="Estoque atual"
            htmlFor="stock"
            hint={
              isEdit ? (
                <>
                  Não editável aqui:{" "}
                  <Link href="/estoque" className="underline">
                    use Reabastecer Estoque
                  </Link>{" "}
                  para alterar.
                </>
              ) : undefined
            }
          >
            {isEdit ? (
              <Input id="stock" className={FIELD_INPUT} value={product.stock} disabled />
            ) : (
              <Input
                id="stock"
                name="stock"
                type="number"
                min={0}
                className={FIELD_INPUT}
                defaultValue={0}
                required
              />
            )}
          </Field>

          <Field label="Estoque mínimo" htmlFor="minStock">
            <Input
              id="minStock"
              name="minStock"
              type="number"
              min={0}
              className={FIELD_INPUT}
              defaultValue={product?.minStock ?? 0}
              required
            />
          </Field>
        </Section>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto</CardTitle>
            <CardDescription>JPEG, PNG ou WEBP, até 5 MB</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label
              htmlFor="photo"
              className="group flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40 transition-colors hover:border-primary/60"
            >
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Foto do produto"
                  width={288}
                  height={288}
                  className="size-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
                  <ImagePlus className="size-6" />
                  Escolher imagem
                </span>
              )}
            </label>
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="h-10 rounded-xl bg-background"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setPhotoFile(file)
                if (file) setPhotoPreview(URL.createObjectURL(file))
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="active" name="active" defaultChecked={product?.active ?? true} />
              <Label htmlFor="active">Produto ativo</Label>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                loading={submitting}
                className="h-11 rounded-xl text-base font-semibold"
              >
                {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar produto"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl"
                onClick={() => router.push("/produtos")}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
