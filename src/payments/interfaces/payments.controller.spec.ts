import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  PaymentTransactionNotFoundError,
  ProcessCardPaymentUseCase,
} from '../application/process-card-payment.use-case';
import { TransactionCannotBeProcessedError } from '../../transactions/domain/transaction.entity';
import { Transaction } from '../../transactions/domain/transaction.entity';
import { TransactionStatus } from '../../transactions/domain/transaction-status';
import { PaymentsController } from './payments.controller';

describe('PaymentsController', () => {
  const transaction = new Transaction({
    id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
    reference: 'PF-reference',
    status: TransactionStatus.APPROVED,
    amountInCents: 18990000,
    currency: 'COP',
    customerName: 'Luis Munar',
    customerEmail: 'luis@example.test',
    gatewayTransactionId: 'gateway-id',
    gatewayStatus: 'APPROVED',
    cardBrand: 'VISA',
    cardLastFour: '4242',
    items: [],
  });
  const dto = {
    card: {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '30',
      cvc: '123',
      cardHolder: 'Luis Munar',
    },
    installments: 1,
  };

  it('processes a card payment', async () => {
    const processCardPayment = jest.fn().mockResolvedValue(transaction);
    const controller = new PaymentsController({
      execute: processCardPayment,
    } as unknown as ProcessCardPaymentUseCase);

    const response = await controller.processCardPayment(
      transaction.id as string,
      dto,
    );

    expect(response.status).toBe(TransactionStatus.APPROVED);
    expect(response.gatewayTransactionId).toBe('gateway-id');
    expect(processCardPayment).toHaveBeenCalledWith({
      transactionId: transaction.id,
      card: dto.card,
      installments: dto.installments,
    });
  });

  it('maps missing transactions to not found', async () => {
    const controller = new PaymentsController({
      execute: jest
        .fn()
        .mockRejectedValue(
          new PaymentTransactionNotFoundError(transaction.id as string),
        ),
    } as unknown as ProcessCardPaymentUseCase);

    await expect(
      controller.processCardPayment(transaction.id as string, dto),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps processed transactions to bad request', async () => {
    const controller = new PaymentsController({
      execute: jest
        .fn()
        .mockRejectedValue(new TransactionCannotBeProcessedError(transaction.id)),
    } as unknown as ProcessCardPaymentUseCase);

    await expect(
      controller.processCardPayment(transaction.id as string, dto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
