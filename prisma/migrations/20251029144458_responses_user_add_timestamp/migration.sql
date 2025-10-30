-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResponseUser" (
    "userId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "answerId"),
    CONSTRAINT "ResponseUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResponseUser_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ResponseUser" ("answerId", "userId") SELECT "answerId", "userId" FROM "ResponseUser";
DROP TABLE "ResponseUser";
ALTER TABLE "new_ResponseUser" RENAME TO "ResponseUser";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
