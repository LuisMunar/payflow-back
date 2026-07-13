import { Module } from '@nestjs/common';
import { TRANSACTIONS_REPOSITORY } from '../transactions/domain/transactions.repository';
import { PrismaTransactionsRepository } from '../transactions/infrastructure/prisma-transactions.repository';
import { ProcessCardPaymentUseCase } from './application/process-card-payment.use-case';
import { PAYMENT_GATEWAY } from './domain/payment-gateway';
import { WompiPaymentGateway } from './infrastructure/wompi-payment-gateway';
import { PaymentsController } from './interfaces/payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [
    ProcessCardPaymentUseCase,
    {
      provide: TRANSACTIONS_REPOSITORY,
      useClass: PrismaTransactionsRepository,
    },
    {
      provide: PAYMENT_GATEWAY,
      useClass: WompiPaymentGateway,
    },
  ],
})
export class PaymentsModule {}
