-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_guildId_fkey";

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "guildId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guilds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
