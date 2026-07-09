-- AlterTable
ALTER TABLE "Product" ADD COLUMN "defaultDoseMl" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FixedCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDay" INTEGER,
    "recurrence" TEXT NOT NULL DEFAULT 'MONTHLY',
    "paymentMethod" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FixedCost" ("id", "name", "category", "amount", "dueDay", "recurrence", "paymentMethod", "notes", "active", "createdAt", "updatedAt")
SELECT "id", "name", "category", "monthlyAmount", "dueDay", 'MONTHLY', "paymentMethod", "notes", "active", "createdAt", "updatedAt" FROM "FixedCost";
DROP TABLE "FixedCost";
ALTER TABLE "new_FixedCost" RENAME TO "FixedCost";
CREATE INDEX "FixedCost_active_idx" ON "FixedCost"("active");
CREATE INDEX "FixedCost_category_idx" ON "FixedCost"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
