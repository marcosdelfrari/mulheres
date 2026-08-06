-- Rename duration unit from days to hours; default package is 4 hours.
ALTER TABLE "LuxoPayment" RENAME COLUMN "days" TO "hours";
ALTER TABLE "LuxoPayment" ALTER COLUMN "hours" SET DEFAULT 4;
UPDATE "LuxoPayment" SET "hours" = 4 WHERE "hours" >= 7;
