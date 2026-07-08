-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purchasePrice" INTEGER NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "code" TEXT,
    "barcode" TEXT,
    "photoUrl" TEXT,
    "description" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "productType" TEXT NOT NULL DEFAULT 'SIMPLE',
    "volumeMl" INTEGER,
    "fullBottleSalePrice" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("active", "barcode", "category", "code", "createdAt", "description", "id", "minStock", "name", "photoUrl", "purchasePrice", "salePrice", "stock", "supplier", "updatedAt") SELECT "active", "barcode", "category", "code", "createdAt", "description", "id", "minStock", "name", "photoUrl", "purchasePrice", "salePrice", "stock", "supplier", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_active_idx" ON "Product"("active");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
