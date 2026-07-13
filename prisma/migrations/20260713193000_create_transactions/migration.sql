CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'ERROR');

CREATE TABLE "transactions" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
  "amountInCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'COP',
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "cardBrand" TEXT,
  "cardLastFour" TEXT,
  "gatewayTransactionId" TEXT,
  "gatewayStatus" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transaction_items" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPriceInCents" INTEGER NOT NULL,
  "totalInCents" INTEGER NOT NULL,

  CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

ALTER TABLE "transaction_items"
  ADD CONSTRAINT "transaction_items_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "transactions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transaction_items"
  ADD CONSTRAINT "transaction_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
