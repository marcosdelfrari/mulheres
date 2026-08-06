-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "age" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'Mulher',
ADD COLUMN     "online" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'Minas Gerais',
ADD COLUMN     "serviceLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "servicesFor" TEXT[] DEFAULT ARRAY[]::TEXT[];
