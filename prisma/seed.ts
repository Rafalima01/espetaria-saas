import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../lib/generated/prisma/client"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
})
const prisma = new PrismaClient({ adapter })

const SEED_USERS = [
  { name: "Admin Geral", email: "admin@espetaria.com", role: "ADMIN" as const },
  { name: "Gerente Silva", email: "gerente@espetaria.com", role: "MANAGER" as const },
  { name: "Caixa Souza", email: "caixa@espetaria.com", role: "CASHIER" as const },
  { name: "Garcom Lima", email: "garcom@espetaria.com", role: "WAITER" as const },
]
const SEED_PASSWORD = "espetaria123"

// SIMPLE products: whole-unit stock, no ml tracking.
const SEED_SIMPLE_PRODUCTS = [
  { name: "Espeto de Carne", category: "Espetos", purchasePrice: 450, salePrice: 900, stock: 40, minStock: 15, code: "ESP001" },
  { name: "Espeto de Frango", category: "Espetos", purchasePrice: 400, salePrice: 800, stock: 35, minStock: 15, code: "ESP002" },
  { name: "Espeto de Linguiça", category: "Espetos", purchasePrice: 380, salePrice: 750, stock: 8, minStock: 15, code: "ESP003" },
  { name: "Espeto de Coração", category: "Espetos", purchasePrice: 420, salePrice: 850, stock: 20, minStock: 10, code: "ESP004" },
  { name: "Espeto de Queijo Coalho", category: "Espetos", purchasePrice: 350, salePrice: 700, stock: 25, minStock: 10, code: "ESP005" },
  { name: "Espeto de Pão de Alho", category: "Espetos", purchasePrice: 250, salePrice: 600, stock: 30, minStock: 10, code: "ESP006" },
  { name: "Batata Frita", category: "Porções", purchasePrice: 800, salePrice: 2500, stock: 18, minStock: 10, code: "POR001" },
  { name: "Mandioca Frita", category: "Porções", purchasePrice: 700, salePrice: 2200, stock: 15, minStock: 10, code: "POR002" },
  { name: "Polenta Frita", category: "Porções", purchasePrice: 600, salePrice: 2000, stock: 5, minStock: 8, code: "POR003" },
  { name: "Calabresa Acebolada", category: "Porções", purchasePrice: 900, salePrice: 2800, stock: 12, minStock: 8, code: "POR004" },
  { name: "Heineken 600ml", category: "Bebidas - Cerveja", purchasePrice: 800, salePrice: 1500, stock: 48, minStock: 24, code: "CEV001" },
  { name: "Original 600ml", category: "Bebidas - Cerveja", purchasePrice: 700, salePrice: 1300, stock: 60, minStock: 24, code: "CEV002" },
  { name: "Brahma Latão", category: "Bebidas - Cerveja", purchasePrice: 400, salePrice: 800, stock: 10, minStock: 24, code: "CEV003" },
  { name: "Coca-Cola 350ml", category: "Refrigerantes", purchasePrice: 300, salePrice: 700, stock: 50, minStock: 20, code: "REF001" },
  { name: "Guaraná 350ml", category: "Refrigerantes", purchasePrice: 280, salePrice: 650, stock: 45, minStock: 20, code: "REF002" },
  { name: "Água Mineral", category: "Refrigerantes", purchasePrice: 150, salePrice: 400, stock: 60, minStock: 20, code: "REF003" },
  { name: "Copo Long Drink 300ml", category: "Copos", purchasePrice: 100, salePrice: 0, stock: 80, minStock: 20, code: "COP001" },
  { name: "Copão 500ml", category: "Copos", purchasePrice: 150, salePrice: 0, stock: 60, minStock: 15, code: "COP002" },
  { name: "Copo Shot 60ml", category: "Copos", purchasePrice: 50, salePrice: 0, stock: 100, minStock: 20, code: "COP003" },
  { name: "Gelo (kg)", category: "Gelo", purchasePrice: 200, salePrice: 0, stock: 30, minStock: 10, code: "GEL001" },
]

// FRACTIONAL products: ml-tracked, sold by dose and/or whole sealed unit.
const SEED_FRACTIONAL_PRODUCTS = [
  {
    name: "Jack Daniels 1000ml",
    category: "Whisky",
    volumeMl: 1000,
    purchasePrice: 8000,
    fullBottleSalePrice: 30000,
    stock: 6,
    minStock: 2,
    code: "GAR001",
    doses: [
      { volumeMl: 50, salePrice: 2500 },
      { volumeMl: 100, salePrice: 4500 },
    ],
  },
  {
    name: "Old Parr 1000ml",
    category: "Whisky",
    volumeMl: 1000,
    purchasePrice: 9000,
    fullBottleSalePrice: 32000,
    stock: 4,
    minStock: 2,
    code: "GAR002",
    doses: [
      { volumeMl: 50, salePrice: 2200 },
      { volumeMl: 100, salePrice: 4000 },
    ],
  },
  {
    name: "Smirnoff 998ml",
    category: "Vodka",
    volumeMl: 998,
    purchasePrice: 4000,
    fullBottleSalePrice: 15000,
    stock: 5,
    minStock: 2,
    code: "GAR003",
    doses: [
      { volumeMl: 40, salePrice: 1200 },
      { volumeMl: 60, salePrice: 1700 },
    ],
  },
  {
    name: "Tanqueray 750ml",
    category: "Gin",
    volumeMl: 750,
    purchasePrice: 7000,
    fullBottleSalePrice: 25000,
    stock: 3,
    minStock: 2,
    code: "GAR004",
    doses: [{ volumeMl: 50, salePrice: 2000 }],
  },
  {
    name: "Cachaça 51 965ml",
    category: "Cachaça",
    volumeMl: 965,
    purchasePrice: 1500,
    fullBottleSalePrice: 6000,
    stock: 8,
    minStock: 3,
    code: "GAR005",
    doses: [
      { volumeMl: 40, salePrice: 600 },
      { volumeMl: 60, salePrice: 850 },
    ],
  },
  {
    name: "Energético 269ml",
    category: "Energético",
    volumeMl: 269,
    purchasePrice: 300,
    fullBottleSalePrice: null,
    stock: 60,
    minStock: 24,
    code: "GAR006",
    doses: [],
  },
]

const PAYMENT_METHODS = ["PIX", "CASH", "CREDIT", "DEBIT", "VOUCHER"] as const

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

const SEED_DOSE_SIZES = [20, 30, 40, 50, 60, 100]

async function main() {
  console.log("Limpando dados existentes...")
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

  console.log("Criando usuários...")
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)
  const users = []
  for (const u of SEED_USERS) {
    users.push(
      await prisma.user.create({
        data: { name: u.name, email: u.email, role: u.role, passwordHash },
      })
    )
  }
  const cashier = users.find((u) => u.role === "CASHIER")!

  console.log("Criando produtos simples...")
  const products = []
  for (const p of SEED_SIMPLE_PRODUCTS) {
    products.push(
      await prisma.product.create({ data: { ...p, productType: "SIMPLE", active: true } })
    )
  }
  const gelo = products.find((p) => p.code === "GEL001")!
  const copao = products.find((p) => p.code === "COP002")!

  console.log("Criando histórico de vendas (últimos 30 dias)...")
  const now = Date.now()
  for (let day = 29; day >= 0; day--) {
    const salesToday = randomInt(2, 6)
    for (let s = 0; s < salesToday; s++) {
      const hour = randomInt(11, 23)
      const createdAt = new Date(
        now - day * 24 * 60 * 60 * 1000 - (23 - hour) * 60 * 60 * 1000
      )
      const itemCount = randomInt(1, 4)
      const chosen = new Set<number>()
      while (chosen.size < itemCount) chosen.add(randomInt(0, products.length - 1))

      let subtotal = 0
      const itemsData: {
        productId: string
        quantity: number
        unitPrice: number
        costPriceSnapshot: number
        total: number
      }[] = []
      for (const idx of chosen) {
        const product = products[idx]
        const quantity = randomInt(1, 3)
        const total = product.salePrice * quantity
        subtotal += total
        itemsData.push({
          productId: product.id,
          quantity,
          unitPrice: product.salePrice,
          costPriceSnapshot: product.purchasePrice,
          total,
        })
      }

      const discount = Math.random() < 0.15 ? Math.round(subtotal * 0.05) : 0
      const total = subtotal - discount

      const useSplit = Math.random() < 0.2
      const paymentsData = useSplit
        ? (() => {
            const methodA = pick(PAYMENT_METHODS)
            let methodB = pick(PAYMENT_METHODS)
            while (methodB === methodA) methodB = pick(PAYMENT_METHODS)
            const amountA = Math.round(total * 0.5)
            return [
              { method: methodA, amount: amountA },
              { method: methodB, amount: total - amountA },
            ]
          })()
        : [{ method: pick(PAYMENT_METHODS), amount: total }]

      const sale = await prisma.sale.create({
        data: {
          status: "COMPLETED",
          subtotal,
          discount,
          surcharge: 0,
          total,
          userId: cashier.id,
          createdAt,
          items: { create: itemsData },
          payments: { create: paymentsData },
        },
      })

      for (const item of itemsData) {
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: item.quantity,
            userId: cashier.id,
            saleId: sale.id,
            createdAt,
          },
        })
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }
  }

  // The random sales history above can push stock below zero. Clamp anything
  // negative back to a small positive number so the low-stock demo data reads
  // as "quase acabando", not as a broken negative count.
  const negativeStock = await prisma.product.findMany({
    where: { stock: { lt: 0 } },
  })
  for (const product of negativeStock) {
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: randomInt(1, 3) },
    })
  }

  console.log("Criando tamanhos de dose e produtos fracionados (garrafas)...")
  const doseSizeBySize = new Map<number, { id: string }>()
  for (const volumeMl of SEED_DOSE_SIZES) {
    doseSizeBySize.set(volumeMl, await prisma.doseSize.create({ data: { volumeMl } }))
  }

  const bottleByCode = new Map<string, Awaited<ReturnType<typeof prisma.product.create>>>()
  for (const b of SEED_FRACTIONAL_PRODUCTS) {
    const { doses, ...bottleData } = b
    const bottle = await prisma.product.create({
      data: {
        ...bottleData,
        salePrice: bottleData.fullBottleSalePrice ?? 0,
        productType: "FRACTIONAL",
        active: true,
      },
    })
    bottleByCode.set(b.code, bottle)
    for (const dose of doses) {
      const doseSize = doseSizeBySize.get(dose.volumeMl)!
      await prisma.bottleDosePrice.create({
        data: { productId: bottle.id, doseSizeId: doseSize.id, salePrice: dose.salePrice },
      })
    }
  }

  console.log("Abrindo algumas garrafas (histórico de instâncias e movimentos)...")
  const jackDaniels = bottleByCode.get("GAR001")!
  const smirnoff = bottleByCode.get("GAR003")!
  const cachaca = bottleByCode.get("GAR005")!

  // Jack Daniels: one instance opened a few days ago, partially poured.
  {
    const openedAt = new Date(now - 3 * 24 * 60 * 60 * 1000)
    const instance = await prisma.bottleInstance.create({
      data: {
        productId: jackDaniels.id,
        remainingMl: jackDaniels.volumeMl! - 150,
        status: "OPEN",
        openedAt,
        openedByUserId: cashier.id,
      },
    })
    await prisma.product.update({ where: { id: jackDaniels.id }, data: { stock: { decrement: 1 } } })
    await prisma.bottleMovement.create({
      data: { productId: jackDaniels.id, bottleInstanceId: instance.id, type: "OPEN", units: 1, userId: cashier.id, createdAt: openedAt },
    })
    for (let i = 0; i < 3; i++) {
      await prisma.bottleMovement.create({
        data: {
          productId: jackDaniels.id,
          bottleInstanceId: instance.id,
          type: "DOSE_SALE",
          volumeMl: 50,
          userId: cashier.id,
          createdAt: new Date(openedAt.getTime() + i * 60 * 60 * 1000),
        },
      })
    }
  }

  // Smirnoff: one instance already finished (empty), fully depleted in doses.
  {
    const openedAt = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const instance = await prisma.bottleInstance.create({
      data: {
        productId: smirnoff.id,
        remainingMl: 0,
        status: "EMPTY",
        openedAt,
        openedByUserId: cashier.id,
        closedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
      },
    })
    await prisma.product.update({ where: { id: smirnoff.id }, data: { stock: { decrement: 1 } } })
    await prisma.bottleMovement.create({
      data: { productId: smirnoff.id, bottleInstanceId: instance.id, type: "OPEN", units: 1, userId: cashier.id, createdAt: openedAt },
    })
    const dosesToEmpty = Math.floor(smirnoff.volumeMl! / 60)
    for (let i = 0; i < dosesToEmpty; i++) {
      await prisma.bottleMovement.create({
        data: {
          productId: smirnoff.id,
          bottleInstanceId: instance.id,
          type: "DOSE_SALE",
          volumeMl: 60,
          userId: cashier.id,
          createdAt: new Date(openedAt.getTime() + i * 3 * 60 * 60 * 1000),
        },
      })
    }
  }

  // Cachaça: one instance opened yesterday, still mostly full.
  {
    const openedAt = new Date(now - 1 * 24 * 60 * 60 * 1000)
    const instance = await prisma.bottleInstance.create({
      data: {
        productId: cachaca.id,
        remainingMl: cachaca.volumeMl! - 40,
        status: "OPEN",
        openedAt,
        openedByUserId: cashier.id,
      },
    })
    await prisma.product.update({ where: { id: cachaca.id }, data: { stock: { decrement: 1 } } })
    await prisma.bottleMovement.create({
      data: { productId: cachaca.id, bottleInstanceId: instance.id, type: "OPEN", units: 1, userId: cashier.id, createdAt: openedAt },
    })
    await prisma.bottleMovement.create({
      data: { productId: cachaca.id, bottleInstanceId: instance.id, type: "DOSE_SALE", volumeMl: 40, userId: cashier.id, createdAt: openedAt },
    })
  }

  console.log("Criando receitas...")
  const energetico = bottleByCode.get("GAR006")!
  await prisma.recipe.create({
    data: {
      name: "Copão 500ml - Cachaça",
      cupProductId: copao.id,
      salePrice: 2200,
      description: "Cachaça com energético e gelo",
      ingredients: {
        create: [
          { productId: cachaca.id, volumeMl: 100 },
          { productId: energetico.id, volumeMl: 250 },
          { productId: gelo.id },
        ],
      },
    },
  })
  await prisma.recipe.create({
    data: {
      name: "Copão 500ml - Whisky",
      cupProductId: copao.id,
      salePrice: 2800,
      description: "Whisky com energético e gelo",
      ingredients: {
        create: [
          { productId: jackDaniels.id, volumeMl: 60 },
          { productId: energetico.id, volumeMl: 250 },
          { productId: gelo.id },
        ],
      },
    },
  })

  console.log("Criando alguns registros de venda de doses históricas...")
  for (let i = 0; i < 6; i++) {
    const daysAgo = randomInt(1, 13)
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000)
    const bottle = pick([jackDaniels, smirnoff, cachaca])
    const doseMl = bottle.id === jackDaniels.id ? 50 : bottle.id === smirnoff.id ? 60 : 40
    const dosePrice = await prisma.bottleDosePrice.findFirst({
      where: { productId: bottle.id, doseSize: { volumeMl: doseMl } },
    })
    if (!dosePrice) continue

    const costPriceSnapshot = Math.round((bottle.purchasePrice / bottle.volumeMl!) * doseMl)
    const total = dosePrice.salePrice

    const sale = await prisma.sale.create({
      data: {
        status: "COMPLETED",
        subtotal: total,
        discount: 0,
        surcharge: 0,
        total,
        userId: cashier.id,
        createdAt,
        payments: { create: [{ method: pick(PAYMENT_METHODS), amount: total }] },
      },
    })
    await prisma.doseSaleItem.create({
      data: {
        saleId: sale.id,
        productId: bottle.id,
        doseSizeId: dosePrice.doseSizeId,
        mode: "DOSE",
        volumeMl: doseMl,
        unitPrice: dosePrice.salePrice,
        costPriceSnapshot,
        total,
      },
    })
  }

  console.log("Criando clientes fiado...")
  const creditCustomersData = [
    { name: "João Fiado", phone: "11999990001", creditLimit: 15000, status: "ACTIVE" as const },
    { name: "Maria Cliente", phone: "11999990002", creditLimit: 20000, status: "ACTIVE" as const },
    { name: "Pedro Devedor", phone: "11999990003", creditLimit: 10000, status: "ACTIVE" as const },
    { name: "Carlos Bloqueado", phone: "11999990004", creditLimit: 5000, status: "BLOCKED" as const },
  ]
  const creditCustomers = []
  for (const c of creditCustomersData) {
    creditCustomers.push(await prisma.creditCustomer.create({ data: c }))
  }

  // João: uma conta em aberto, sem pagamento.
  await prisma.financialEntry.create({
    data: {
      type: "RECEIVABLE",
      description: "Venda fiado - espetinhos",
      amount: 4500,
      status: "OPEN",
      dueDate: new Date(now + 20 * 24 * 60 * 60 * 1000),
      creditCustomerId: creditCustomers[0].id,
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
    },
  })

  // Maria: uma conta parcialmente paga.
  {
    const entry = await prisma.financialEntry.create({
      data: {
        type: "RECEIVABLE",
        description: "Venda fiado - doses e porções",
        amount: 8000,
        status: "PARTIALLY_PAID",
        dueDate: new Date(now + 15 * 24 * 60 * 60 * 1000),
        creditCustomerId: creditCustomers[1].id,
        createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
      },
    })
    await prisma.financialPayment.create({
      data: { financialEntryId: entry.id, amount: 3000, method: "CASH", userId: cashier.id },
    })
  }

  // Pedro: uma conta vencida (inadimplente) e uma já paga.
  await prisma.financialEntry.create({
    data: {
      type: "RECEIVABLE",
      description: "Venda fiado - bebidas",
      amount: 6000,
      status: "OPEN",
      dueDate: new Date(now - 10 * 24 * 60 * 60 * 1000),
      creditCustomerId: creditCustomers[2].id,
      createdAt: new Date(now - 40 * 24 * 60 * 60 * 1000),
    },
  })
  {
    const paidEntry = await prisma.financialEntry.create({
      data: {
        type: "RECEIVABLE",
        description: "Venda fiado - espetinhos (já quitada)",
        amount: 3000,
        status: "PAID",
        dueDate: new Date(now - 30 * 24 * 60 * 60 * 1000),
        creditCustomerId: creditCustomers[2].id,
        createdAt: new Date(now - 45 * 24 * 60 * 60 * 1000),
      },
    })
    await prisma.financialPayment.create({
      data: { financialEntryId: paidEntry.id, amount: 3000, method: "PIX", userId: cashier.id },
    })
  }

  console.log("\nSeed concluído.")
  console.log("Usuários criados (senha para todos: %s):", SEED_PASSWORD)
  for (const u of SEED_USERS) console.log(`  - ${u.role}: ${u.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
