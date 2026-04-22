-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'SEPAY';

-- AlterTable
ALTER TABLE "products" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
