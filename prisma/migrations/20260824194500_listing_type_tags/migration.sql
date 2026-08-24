-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "typeTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
