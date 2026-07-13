import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTIONS_REPOSITORY,
  TransactionsRepository,
} from '../../transactions/domain/transactions.repository';
import {
  PAYMENT_GATEWAY,
  PaymentGateway,
  PaymentGatewayError,
} from '../domain/payment-gateway';
import {
  Transaction,
  TransactionCannotBeProcessedError,
} from '../../transactions/domain/transaction.entity';

export type ProcessCardPaymentInput = {
  transactionId: string;
  card: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    cardHolder: string;
  };
  installments: number;
};

export class PaymentTransactionNotFoundError extends Error {
  constructor(transactionId: string) {
    super(`Transaction ${transactionId} was not found`);
  }
}

@Injectable()
export class ProcessCardPaymentUseCase {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: ProcessCardPaymentInput): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findById(input.transactionId);

    if (!transaction) {
      throw new PaymentTransactionNotFoundError(input.transactionId);
    }

    transaction.ensureCanBeProcessed();

    try {
      const paymentResult = await this.paymentGateway.processCardPayment({
        reference: transaction.reference,
        amountInCents: transaction.amountInCents,
        currency: transaction.currency,
        customerEmail: transaction.customerEmail,
        card: input.card,
        installments: input.installments,
      });

      transaction.applyGatewayResult(paymentResult);
    } catch (error: unknown) {
      if (!(error instanceof PaymentGatewayError)) {
        throw error;
      }

      transaction.markAsPaymentError();
    }

    return this.transactionsRepository.completePayment(transaction);
  }
}

export { TransactionCannotBeProcessedError };
