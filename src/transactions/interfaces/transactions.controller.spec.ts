import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CreatePendingTransactionUseCase,
  TransactionProductsNotFoundError,
} from '../application/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '../application/get-transaction.use-case';
import { Transaction } from '../domain/transaction.entity';
import { TransactionStatus } from '../domain/transaction-status';
import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  const transaction = new Transaction({
    id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
    reference: 'PF-reference',
    status: TransactionStatus.PENDING,
    amountInCents: 18990000,
    currency: 'COP',
    customerName: 'Luis Munar',
    customerEmail: 'luis@example.test',
    items: [],
  });

  it('creates a pending transaction', async () => {
    const createTransaction = jest.fn().mockResolvedValue(transaction);
    const createUseCase = {
      execute: createTransaction,
    } as unknown as CreatePendingTransactionUseCase;
    const getUseCase = {
      execute: jest.fn(),
    } as unknown as GetTransactionUseCase;
    const controller = new TransactionsController(createUseCase, getUseCase);

    const response = await controller.createTransaction({
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [
        {
          productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
          quantity: 1,
        },
      ],
    });

    expect(response.id).toBe(transaction.id);
    expect(createTransaction).toHaveBeenCalledTimes(1);
  });

  it('maps known transaction creation errors to bad request', async () => {
    const createUseCase = {
      execute: jest
        .fn()
        .mockRejectedValue(
          new TransactionProductsNotFoundError([
            'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
          ]),
        ),
    } as unknown as CreatePendingTransactionUseCase;
    const controller = new TransactionsController(createUseCase, {
      execute: jest.fn(),
    } as unknown as GetTransactionUseCase);

    await expect(
      controller.createTransaction({
        customerName: 'Luis Munar',
        customerEmail: 'luis@example.test',
        items: [
          {
            productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
            quantity: 1,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('gets a transaction by id', async () => {
    const getTransaction = jest.fn().mockResolvedValue(transaction);
    const controller = new TransactionsController(
      { execute: jest.fn() } as unknown as CreatePendingTransactionUseCase,
      { execute: getTransaction } as unknown as GetTransactionUseCase,
    );

    const response = await controller.getTransaction(transaction.id as string);

    expect(response.id).toBe(transaction.id);
    expect(getTransaction).toHaveBeenCalledWith(transaction.id);
  });

  it('throws not found when transaction does not exist', async () => {
    const controller = new TransactionsController(
      { execute: jest.fn() } as unknown as CreatePendingTransactionUseCase,
      { execute: jest.fn().mockResolvedValue(null) } as unknown as GetTransactionUseCase,
    );

    await expect(
      controller.getTransaction('2f860c3a-c995-459e-b8f9-7a945dfd9157'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
