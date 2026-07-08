// Wipes all demo/business data and leaves the system empty, ready for real use.
// Unlike seed.ts (which fills the app with demo data for local development/
// demos), this script creates only the one real Administrator account passed
// via env vars and nothing else — no products, bottles, sales, or customers.
import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../lib/generated/prisma/client"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
})
const prisma = new PrismaClient({ adapter })

const ADMIN_NAME = process.env.RESET_ADMIN_NAME
const ADMIN_EMAIL = process.env.RESET_ADMIN_EMAIL?.trim().toLowerCase()
const ADMIN_PASSWORD = process.env.RESET_ADMIN_PASSWORD

async function main() {
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "Defina RESET_ADMIN_NAME, RESET_ADMIN_EMAIL e RESET_ADMIN_PASSWORD antes de rodar este script."
    )
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("RESET_ADMIN_PASSWORD precisa ter pelo menos 8 caracteres.")
  }

  console.log("Apagando todos os dados de demonstração...")
  await prisma.financialPayment.deleteMany()
  await prisma.financialEntry.deleteMany()
  await prisma.creditCustomer.deleteMany()
  await prisma.doseSaleItem.deleteMany()
  await prisma.recipeSaleItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.bottleMovement.deleteMany()
  await prisma.bottleInstance.deleteMany()
  await prisma.recipeIngredient.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.bottleDosePrice.deleteMany()
  await prisma.doseSize.deleteMany()
  await prisma.product.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.user.deleteMany()

  console.log("Criando o login real de Administrador...")
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const admin = await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  })

  console.log("\nSistema zerado e pronto para uso real.")
  console.log(`Administrador: ${admin.name} <${admin.email}>`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
