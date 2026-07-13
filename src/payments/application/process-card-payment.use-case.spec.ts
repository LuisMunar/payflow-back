import { Transaction } from '../../transactions/domain/transaction.entity';
import { TransactionItem } from '../../transactions/domain/transaction-item.entity';
import { TransactionStatus } from '../../transactions/domain/transaction-status';
import { TransactionsRepository } from '../../transactions/domain/transactions.repository';
import {
  PaymentGateway,
  PaymentGatewayError,
} from '../domain/payment-gateway';
import {
  PaymentTransactionNotFoundError,
  ProcessCardPaymentUseCase,
} from './process-card-payment.use-case';

describe('ProcessCardPaymentUseCase', () => {
  const transaction = new Transaction({
    id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
    reference: 'PF-reference',
    status: TransactionStatus.PENDING,
    amountInCents: 18990000,
    currency: 'COP',
    customerName: 'Luis Munar',
    customerEmail: 'luis@example.test',
    items: [
      new TransactionItem({
        productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
        quantity: 1,
        unitPriceInCents: 18990000,
        totalInCents: 18990000,
      }),
    ],
  });
  const input = {
    transactionId: transaction.id as string,
    card: {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '30',
      cvc: '123',
      cardHolder: 'Luis Munar',
    },
    installments: 1,
  };

  it('processes an approved card payment and persists the result', async () => {
    const processCardPayment = jest.fn().mockResolvedValue({
      status: TransactionStatus.APPROVED,
      gatewayTransactionId: 'gateway-transaction-id',
      gatewayStatus: 'APPROVED',
      cardBrand: 'VISA',
      cardLastFour: '4242',
    });
    const completePayment = jest
      .fn()
      .mockImplementation((updatedTransaction: Transaction) =>
        Promise.resolve(updatedTransaction),
      );
    const transactionsRepository: jest.Mocked<TransactionsRepository> = {
      create: jest.fn(),
      completePayment,
      findById: jest.fn().mockResolvedValue(transaction),
    };
    const paymentGateway: jest.Mocked<PaymentGateway> = {
      processCardPayment,
    };
    const useCase = new ProcessCardPaymentUseCase(
      transactionsRepository,
      paymentGateway,
    );

    const result = await useCase.execute(input);

    expect(processCardPayment).toHaveBeenCalledWith({
      reference: transaction.reference,
      amountInCents: transaction.amountInCents,
      currency: transaction.currency,
      customerEmail: transaction.customerEmail,
      card: input.card,
      installments: input.installments,
    });
    expect(completePayment).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(result.gatewayTransactionId).toBe('gateway-transaction-id');
    expect(result.cardLastFour).toBe('4242');
  });

  it('marks the transaction as error when the payment gateway fails', async () => {
    const completePayment = jest
      .fn()
      .mockImplementation((updatedTransaction: Transaction) =>
        Promise.resolve(updatedTransaction),
      );
    const transactionsRepository: jest.Mocked<TransactionsRepository> = {
      create: jest.fn(),
      completePayment,
      findById: jest.fn().mockResolvedValue(
        new Transaction({
          id: transaction.id,
          reference: transaction.reference,
          status: TransactionStatus.PENDING,
          amountInCents: transaction.amountInCents,
          currency: transaction.currency,
          customerName: transaction.customerName,
          customerEmail: transaction.customerEmail,
          items: transaction.items,
        }),
      ),
    };
    const paymentGateway: jest.Mocked<PaymentGateway> = {
      processCardPayment: jest
        .fn()
        .mockRejectedValue(new PaymentGatewayError('Gateway unavailable')),
    };
    const useCase = new ProcessCardPaymentUseCase(
      transactionsRepository,
      paymentGateway,
    );

    const result = await useCase.execute(input);

    expect(result.status).toBe(TransactionStatus.ERROR);
    expect(result.gatewayStatus).toBe('ERROR');
  });

  it('fails when the transaction does not exist', async () => {
    const transactionsRepository: jest.Mocked<TransactionsRepository> = {
      create: jest.fn(),
      completePayment: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
    };
    const paymentGateway: jest.Mocked<PaymentGateway> = {
      processCardPayment: jest.fn(),
    };
    const useCase = new ProcessCardPaymentUseCase(
      transactionsRepository,
      paymentGateway,
    );

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      PaymentTransactionNotFoundError,
    );
  });

  it('rethrows unexpected payment gateway errors', async () => {
    const unexpectedError = new Error('Unexpected provider failure');
    const completePayment = jest.fn();
    const transactionsRepository: jest.Mocked<TransactionsRepository> = {
      create: jest.fn(),
      completePayment,
      findById: jest.fn().mockResolvedValue(
        new Transaction({
          id: transaction.id,
          reference: transaction.reference,
          status: TransactionStatus.PENDING,
          amountInCents: transaction.amountInCents,
          currency: transaction.currency,
          customerName: transaction.customerName,
          customerEmail: transaction.customerEmail,
          items: transaction.items,
        }),
      ),
    };
    const paymentGateway: jest.Mocked<PaymentGateway> = {
      processCardPayment: jest.fn().mockRejectedValue(unexpectedError),
    };
    const useCase = new ProcessCardPaymentUseCase(
      transactionsRepository,
      paymentGateway,
    );

    await expect(useCase.execute(input)).rejects.toThrow(unexpectedError);
    expect(completePayment).not.toHaveBeenCalled();
  });
});
