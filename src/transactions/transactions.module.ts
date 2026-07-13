import { Module } from '@nestjs/common';
import { PRODUCTS_REPOSITORY } from '../products/domain/products.repository';
import { PrismaProductsRepository } from '../products/infrastructure/prisma-products.repository';
import { CreatePendingTransactionUseCase } from './application/create-pending-transaction.use-case';
import { GetTransactionUseCase } from './application/get-transaction.use-case';
import { TRANSACTIONS_REPOSITORY } from './domain/transactions.repository';
import { PrismaTransactionsRepository } from './infrastructure/prisma-transactions.repository';
import { TransactionsController } from './interfaces/transactions.controller';

@Module({
  controllers: [TransactionsController],
  providers: [
    CreatePendingTransactionUseCase,
    GetTransactionUseCase,
    {
      provide: PRODUCTS_REPOSITORY,
      useClass: PrismaProductsRepository,
    },
    {
      provide: TRANSACTIONS_REPOSITORY,
      useClass: PrismaTransactionsRepository,
    },
  ],
})
export class TransactionsModule {}
