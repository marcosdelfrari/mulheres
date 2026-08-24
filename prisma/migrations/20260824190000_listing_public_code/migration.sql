-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "publicCode" TEXT;

-- Backfill unique 6-digit codes for existing listings
DO $$
DECLARE
  listing_row RECORD;
  next_code TEXT;
BEGIN
  FOR listing_row IN SELECT "id" FROM "Listing" WHERE "publicCode" IS NULL LOOP
    LOOP
      next_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM "Listing" WHERE "publicCode" = next_code
      );
    END LOOP;

    UPDATE "Listing"
    SET "publicCode" = next_code
    WHERE "id" = listing_row."id";
  END LOOP;
END $$;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "publicCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_publicCode_key" ON "Listing"("publicCode");
