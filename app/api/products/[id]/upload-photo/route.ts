import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}
const MAX_SIZE_BYTES = 5 * 1024 * 1024

type Params = { params: Promise<{ id: string }> }

// O tipo declarado pelo navegador não prova nada: confere os primeiros bytes
// do arquivo (assinatura) para garantir que é mesmo JPEG, PNG ou WEBP.
function matchesSignature(bytes: Uint8Array, ext: string) {
  if (ext === "jpg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (ext === "png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)
  }
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to))
  return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP"
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id } = await params
    // Só confirma que o produto existe; o id vindo da URL nunca entra no nome do arquivo.
    const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } })
    if (!exists) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
    }
    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPEG, PNG ou WEBP." },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 5MB)" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!matchesSignature(buffer, ext)) {
      return NextResponse.json(
        { error: "O conteúdo do arquivo não é uma imagem válida." },
        { status: 400 }
      )
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const filename = `${randomUUID()}.${ext}`
    await writeFile(path.join(uploadsDir, filename), buffer)

    const photoUrl = `/uploads/${filename}`
    const product = await prisma.product.update({
      where: { id },
      data: { photoUrl },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao enviar foto" }, { status: 500 })
  }
}
