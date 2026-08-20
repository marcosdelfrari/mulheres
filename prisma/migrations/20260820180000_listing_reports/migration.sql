-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "ListingReport" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "listingTitle" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingReport_status_createdAt_idx" ON "ListingReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ListingReport_listingId_idx" ON "ListingReport"("listingId");

-- AddForeignKey
ALTER TABLE "ListingReport" ADD CONSTRAINT "ListingReport_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
