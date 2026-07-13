import { PrismaService } from '../../prisma/prisma.service';
import { Transaction } from '../domain/transaction.entity';
import { TransactionItem } from '../domain/transaction-item.entity';
import { TransactionStatus } from '../domain/transaction-status';
import { PrismaTransactionWithItems } from './prisma-transaction.mapper';
import { PrismaTransactionsRepository } from './prisma-transactions.repository';

describe('PrismaTransactionsRepository', () => {
  const now = new Date('2026-07-13T00:00:00.000Z');
  const prismaTransaction: PrismaTransactionWithItems = {
    id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
    reference: 'PF-reference',
    status: 'PENDING',
    amountInCents: 18990000,
    currency: 'COP',
    customerName: 'Luis Munar',
    customerEmail: 'luis@example.test',
    cardBrand: null,
    cardLastFour: null,
    gatewayTransactionId: null,
    gatewayStatus: null,
    createdAt: now,
    updatedAt: now,
    items: [
      {
        id: 'a0da9e5c-6612-4603-9094-b1bb5a85d8d0',
        transactionId: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
        productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
        quantity: 1,
        unitPriceInCents: 18990000,
        totalInCents: 18990000,
      },
    ],
  };

  it('creates a transaction with items', async () => {
    const create = jest.fn().mockResolvedValue(prismaTransaction);
    const prisma = {
      transaction: {
        create,
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;
    const repository = new PrismaTransactionsRepository(prisma);
    const transaction = new Transaction({
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

    const created = await repository.create(transaction);

    expect(create).toHaveBeenCalledTimes(1);
    expect(created.id).toBe(prismaTransaction.id);
  });

  it('finds a transaction by id', async () => {
    const findUnique = jest.fn().mockResolvedValue(prismaTransaction);
    const prisma = {
      transaction: {
        create: jest.fn(),
        findUnique,
      },
    } as unknown as PrismaService;
    const repository = new PrismaTransactionsRepository(prisma);

    const transaction = await repository.findById(prismaTransaction.id);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: prismaTransaction.id },
      include: { items: true },
    });
    expect(transaction?.id).toBe(prismaTransaction.id);
  });

  it('returns null when a transaction does not exist', async () => {
    const prisma = {
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;
    const repository = new PrismaTransactionsRepository(prisma);

    await expect(repository.findById(prismaTransaction.id)).resolves.toBeNull();
  });

  it('completes an approved payment and decrements product stock', async () => {
    const updateTransaction = jest.fn<
      Promise<PrismaTransactionWithItems>,
      [Record<string, unknown>]
    >().mockResolvedValue({
      ...prismaTransaction,
      status: 'APPROVED',
      gatewayTransactionId: 'gateway-id',
      gatewayStatus: 'APPROVED',
      cardBrand: 'VISA',
      cardLastFour: '4242',
    });
    const updateProduct = jest.fn();
    type TransactionClient = {
      transaction: { update: typeof updateTransaction };
      product: { update: typeof updateProduct };
    };
    type PrismaCallback = (
      transactionClient: TransactionClient,
    ) => Promise<PrismaTransactionWithItems>;
    const transactionCallback = jest.fn((callback: PrismaCallback) =>
      callback({
        transaction: {
          update: updateTransaction,
        },
        product: {
          update: updateProduct,
        },
      }),
    );
    const prisma = {
      $transaction: transactionCallback,
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;
    const repository = new PrismaTransactionsRepository(prisma);
    const transaction = new Transaction({
      id: prismaTransaction.id,
      reference: prismaTransaction.reference,
      status: TransactionStatus.APPROVED,
      amountInCents: prismaTransaction.amountInCents,
      currency: prismaTransaction.currency,
      customerName: prismaTransaction.customerName,
      customerEmail: prismaTransaction.customerEmail,
      gatewayTransactionId: 'gateway-id',
      gatewayStatus: 'APPROVED',
      cardBrand: 'VISA',
      cardLastFour: '4242',
      items: [
        new TransactionItem({
          productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
          quantity: 2,
          unitPriceInCents: 18990000,
          totalInCents: 37980000,
        }),
      ],
    });

    const completed = await repository.completePayment(transaction);

    const [updateArgs] = updateTransaction.mock.calls[0];

    expect(updateArgs.where).toEqual({ id: prismaTransaction.id });
    expect(updateArgs.data).toMatchObject({
      status: TransactionStatus.APPROVED,
      gatewayTransactionId: 'gateway-id',
      gatewayStatus: 'APPROVED',
    });
    expect(updateProduct).toHaveBeenCalledWith({
      where: { id: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49' },
      data: {
        stock: {
          decrement: 2,
        },
      },
    });
    expect(completed.status).toBe(TransactionStatus.APPROVED);
  });
});
