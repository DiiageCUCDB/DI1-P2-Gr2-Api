/*
  Warnings:

  - Added the required column `name` to the `Guilds` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guilds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Guilds" ("createdAt", "id", "score", "updatedAt") SELECT "createdAt", "id", "score", "updatedAt" FROM "Guilds";
DROP TABLE "Guilds";
ALTER TABLE "new_Guilds" RENAME TO "Guilds";
CREATE UNIQUE INDEX "Guilds_name_key" ON "Guilds"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
