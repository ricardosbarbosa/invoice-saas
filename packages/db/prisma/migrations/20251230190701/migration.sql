/*
  Warnings:

  - You are about to drop the column `currency` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAmount` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `shippingTaxRate` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `terms` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `invoice_item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "client" DROP COLUMN "currency";

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "shippingAmount",
DROP COLUMN "shippingTaxRate",
DROP COLUMN "terms";

-- AlterTable
ALTER TABLE "invoice_item" DROP COLUMN "taxRate";

-- DropEnum
DROP TYPE "DiscountType";
