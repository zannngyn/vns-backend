/*
  Warnings:

  - You are about to drop the column `embedding` on the `product_embeddings` table. All the data in the column will be lost.
  - You are about to drop the column `search_vector` on the `products` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- DropIndex
DROP INDEX "idx_product_embeddings_vector";

-- DropIndex
DROP INDEX "idx_products_search";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "coupon_id" BIGINT,
ADD COLUMN     "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "product_embeddings" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "product_skus" ADD COLUMN     "promotion_id" BIGINT,
ADD COLUMN     "sale_price" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "products" DROP COLUMN "search_vector";

-- CreateTable
CREATE TABLE "coupons" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "min_order_value" DECIMAL(12,2),
    "max_discount_value" DECIMAL(12,2),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- AddForeignKey
ALTER TABLE "product_skus" ADD CONSTRAINT "product_skus_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
