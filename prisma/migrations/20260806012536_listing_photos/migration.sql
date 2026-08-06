-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];
