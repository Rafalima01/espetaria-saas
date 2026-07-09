-- CreateTable
CREATE TABLE "FixedCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "monthlyAmount" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FinancialEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueDate" DATETIME NOT NULL,
    "creditCustomerId" TEXT,
    "saleId" TEXT,
    "fixedCostId" TEXT,
    "competencia" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinancialEntry_creditCustomerId_fkey" FOREIGN KEY ("creditCustomerId") REFERENCES "CreditCustomer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FinancialEntry_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FinancialEntry_fixedCostId_fkey" FOREIGN KEY ("fixedCostId") REFERENCES "FixedCost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FinancialEntry" ("amount", "createdAt", "creditCustomerId", "description", "dueDate", "id", "saleId", "status", "type", "updatedAt") SELECT "amount", "createdAt", "creditCustomerId", "description", "dueDate", "id", "saleId", "status", "type", "updatedAt" FROM "FinancialEntry";
DROP TABLE "FinancialEntry";
ALTER TABLE "new_FinancialEntry" RENAME TO "FinancialEntry";
CREATE INDEX "FinancialEntry_creditCustomerId_idx" ON "FinancialEntry"("creditCustomerId");
CREATE INDEX "FinancialEntry_status_idx" ON "FinancialEntry"("status");
CREATE INDEX "FinancialEntry_dueDate_idx" ON "FinancialEntry"("dueDate");
CREATE UNIQUE INDEX "FinancialEntry_fixedCostId_competencia_key" ON "FinancialEntry"("fixedCostId", "competencia");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FixedCost_active_idx" ON "FixedCost"("active");

-- CreateIndex
CREATE INDEX "FixedCost_category_idx" ON "FixedCost"("category");
