-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "nsfwPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[];
