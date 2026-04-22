/*
  Warnings:

  - You are about to drop the column `embedding` on the `product_embeddings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_product_embeddings_vector";

-- AlterTable
ALTER TABLE "product_embeddings" DROP COLUMN "embedding";
