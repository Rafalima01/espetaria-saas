-- CreateTable
CREATE TABLE "Bottle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "volumeMl" INTEGER NOT NULL,
    "purchasePrice" INTEGER NOT NULL,
    "fullBottleSalePrice" INTEGER,
    "photoUrl" TEXT,
    "code" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DoseSize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "volumeMl" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BottleDosePrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bottleId" TEXT NOT NULL,
    "doseSizeId" TEXT NOT NULL,
    "salePrice" INTEGER NOT NULL,
    CONSTRAINT "BottleDosePrice_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BottleDosePrice_doseSizeId_fkey" FOREIGN KEY ("doseSizeId") REFERENCES "DoseSize" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BottleInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bottleId" TEXT NOT NULL,
    "remainingMl" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedByUserId" TEXT NOT NULL,
    "closedAt" DATETIME,
    CONSTRAINT "BottleInstance_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BottleInstance_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BottleMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bottleId" TEXT NOT NULL,
    "bottleInstanceId" TEXT,
    "type" TEXT NOT NULL,
    "volumeMl" INTEGER,
    "units" INTEGER,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "saleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BottleMovement_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BottleMovement_bottleInstanceId_fkey" FOREIGN KEY ("bottleInstanceId") REFERENCES "BottleInstance" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BottleMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BottleMovement_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacityMl" INTEGER NOT NULL,
    "type" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cupId" TEXT,
    "salePrice" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recipe_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "bottleId" TEXT,
    "label" TEXT,
    "volumeMl" INTEGER NOT NULL,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoseSaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "doseSizeId" TEXT,
    "bottleInstanceId" TEXT,
    "mode" TEXT NOT NULL,
    "volumeMl" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "costPriceSnapshot" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "note" TEXT,
    "cancelledAt" DATETIME,
    CONSTRAINT "DoseSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DoseSaleItem_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DoseSaleItem_doseSizeId_fkey" FOREIGN KEY ("doseSizeId") REFERENCES "DoseSize" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DoseSaleItem_bottleInstanceId_fkey" FOREIGN KEY ("bottleInstanceId") REFERENCES "BottleInstance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeSaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "costPriceSnapshot" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "note" TEXT,
    "cancelledAt" DATETIME,
    CONSTRAINT "RecipeSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeSaleItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditCustomer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "cpf" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "creditLimit" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FinancialEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueDate" DATETIME NOT NULL,
    "creditCustomerId" TEXT,
    "saleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinancialEntry_creditCustomerId_fkey" FOREIGN KEY ("creditCustomerId") REFERENCES "CreditCustomer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FinancialEntry_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "financialEntryId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT,
    "note" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialPayment_financialEntryId_fkey" FOREIGN KEY ("financialEntryId") REFERENCES "FinancialEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FinancialPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Bottle_code_key" ON "Bottle"("code");

-- CreateIndex
CREATE INDEX "Bottle_category_idx" ON "Bottle"("category");

-- CreateIndex
CREATE INDEX "Bottle_active_idx" ON "Bottle"("active");

-- CreateIndex
CREATE UNIQUE INDEX "DoseSize_volumeMl_key" ON "DoseSize"("volumeMl");

-- CreateIndex
CREATE UNIQUE INDEX "BottleDosePrice_bottleId_doseSizeId_key" ON "BottleDosePrice"("bottleId", "doseSizeId");

-- CreateIndex
CREATE INDEX "BottleInstance_bottleId_status_idx" ON "BottleInstance"("bottleId", "status");

-- CreateIndex
CREATE INDEX "BottleMovement_bottleId_createdAt_idx" ON "BottleMovement"("bottleId", "createdAt");

-- CreateIndex
CREATE INDEX "BottleMovement_bottleInstanceId_idx" ON "BottleMovement"("bottleInstanceId");

-- CreateIndex
CREATE INDEX "BottleMovement_type_idx" ON "BottleMovement"("type");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

-- CreateIndex
CREATE INDEX "DoseSaleItem_saleId_idx" ON "DoseSaleItem"("saleId");

-- CreateIndex
CREATE INDEX "DoseSaleItem_bottleId_idx" ON "DoseSaleItem"("bottleId");

-- CreateIndex
CREATE INDEX "RecipeSaleItem_saleId_idx" ON "RecipeSaleItem"("saleId");

-- CreateIndex
CREATE INDEX "CreditCustomer_status_idx" ON "CreditCustomer"("status");

-- CreateIndex
CREATE INDEX "CreditCustomer_name_idx" ON "CreditCustomer"("name");

-- CreateIndex
CREATE INDEX "FinancialEntry_creditCustomerId_idx" ON "FinancialEntry"("creditCustomerId");

-- CreateIndex
CREATE INDEX "FinancialEntry_status_idx" ON "FinancialEntry"("status");

-- CreateIndex
CREATE INDEX "FinancialEntry_dueDate_idx" ON "FinancialEntry"("dueDate");

-- CreateIndex
CREATE INDEX "FinancialPayment_financialEntryId_idx" ON "FinancialPayment"("financialEntryId");
