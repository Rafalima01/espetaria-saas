/*
  Warnings:

  - You are about to drop the `Bottle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `bottleId` on the `BottleDosePrice` table. All the data in the column will be lost.
  - You are about to drop the column `bottleId` on the `BottleInstance` table. All the data in the column will be lost.
  - You are about to drop the column `bottleId` on the `BottleMovement` table. All the data in the column will be lost.
  - You are about to drop the column `bottleId` on the `DoseSaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `cupId` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `bottleId` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `RecipeIngredient` table. All the data in the column will be lost.
  - Added the required column `productId` to the `BottleDosePrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `BottleInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `BottleMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `DoseSaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Bottle_active_idx";

-- DropIndex
DROP INDEX "Bottle_category_idx";

-- DropIndex
DROP INDEX "Bottle_code_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Bottle";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Cup";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BottleDosePrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "doseSizeId" TEXT NOT NULL,
    "salePrice" INTEGER NOT NULL,
    CONSTRAINT "BottleDosePrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BottleDosePrice_doseSizeId_fkey" FOREIGN KEY ("doseSizeId") REFERENCES "DoseSize" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BottleDosePrice" ("doseSizeId", "id", "salePrice") SELECT "doseSizeId", "id", "salePrice" FROM "BottleDosePrice";
DROP TABLE "BottleDosePrice";
ALTER TABLE "new_BottleDosePrice" RENAME TO "BottleDosePrice";
CREATE UNIQUE INDEX "BottleDosePrice_productId_doseSizeId_key" ON "BottleDosePrice"("productId", "doseSizeId");
CREATE TABLE "new_BottleInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "remainingMl" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedByUserId" TEXT NOT NULL,
    "closedAt" DATETIME,
    CONSTRAINT "BottleInstance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BottleInstance_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BottleInstance" ("closedAt", "id", "openedAt", "openedByUserId", "remainingMl", "status") SELECT "closedAt", "id", "openedAt", "openedByUserId", "remainingMl", "status" FROM "BottleInstance";
DROP TABLE "BottleInstance";
ALTER TABLE "new_BottleInstance" RENAME TO "BottleInstance";
CREATE INDEX "BottleInstance_productId_status_idx" ON "BottleInstance"("productId", "status");
CREATE TABLE "new_BottleMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "bottleInstanceId" TEXT,
    "type" TEXT NOT NULL,
    "volumeMl" INTEGER,
    "units" INTEGER,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "saleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BottleMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BottleMovement_bottleInstanceId_fkey" FOREIGN KEY ("bottleInstanceId") REFERENCES "BottleInstance" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BottleMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BottleMovement_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BottleMovement" ("bottleInstanceId", "createdAt", "id", "reason", "saleId", "type", "units", "userId", "volumeMl") SELECT "bottleInstanceId", "createdAt", "id", "reason", "saleId", "type", "units", "userId", "volumeMl" FROM "BottleMovement";
DROP TABLE "BottleMovement";
ALTER TABLE "new_BottleMovement" RENAME TO "BottleMovement";
CREATE INDEX "BottleMovement_productId_createdAt_idx" ON "BottleMovement"("productId", "createdAt");
CREATE INDEX "BottleMovement_bottleInstanceId_idx" ON "BottleMovement"("bottleInstanceId");
CREATE INDEX "BottleMovement_type_idx" ON "BottleMovement"("type");
CREATE TABLE "new_DoseSaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
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
    CONSTRAINT "DoseSaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DoseSaleItem_doseSizeId_fkey" FOREIGN KEY ("doseSizeId") REFERENCES "DoseSize" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DoseSaleItem_bottleInstanceId_fkey" FOREIGN KEY ("bottleInstanceId") REFERENCES "BottleInstance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DoseSaleItem" ("bottleInstanceId", "cancelledAt", "costPriceSnapshot", "discount", "doseSizeId", "id", "mode", "note", "saleId", "total", "unitPrice", "volumeMl") SELECT "bottleInstanceId", "cancelledAt", "costPriceSnapshot", "discount", "doseSizeId", "id", "mode", "note", "saleId", "total", "unitPrice", "volumeMl" FROM "DoseSaleItem";
DROP TABLE "DoseSaleItem";
ALTER TABLE "new_DoseSaleItem" RENAME TO "DoseSaleItem";
CREATE INDEX "DoseSaleItem_saleId_idx" ON "DoseSaleItem"("saleId");
CREATE INDEX "DoseSaleItem_productId_idx" ON "DoseSaleItem"("productId");
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cupProductId" TEXT,
    "salePrice" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recipe_cupProductId_fkey" FOREIGN KEY ("cupProductId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Recipe" ("active", "createdAt", "description", "id", "name", "photoUrl", "salePrice", "updatedAt") SELECT "active", "createdAt", "description", "id", "name", "photoUrl", "salePrice", "updatedAt" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
CREATE TABLE "new_RecipeIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "volumeMl" INTEGER NOT NULL,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeIngredient" ("id", "recipeId", "volumeMl") SELECT "id", "recipeId", "volumeMl" FROM "RecipeIngredient";
DROP TABLE "RecipeIngredient";
ALTER TABLE "new_RecipeIngredient" RENAME TO "RecipeIngredient";
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
