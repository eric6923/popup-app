-- CreateEnum
CREATE TYPE "Type" AS ENUM ('OPT_IN', 'SPIN_WHEEL');

-- AlterTable
ALTER TABLE "Popup" ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'OPT_IN';
