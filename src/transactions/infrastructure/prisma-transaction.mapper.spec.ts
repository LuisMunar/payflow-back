import { PrismaTransactionMapper, PrismaTransactionWithItems } from './prisma-transaction.mapper';

describe('PrismaTransactionMapper', () => {
  it('maps a Prisma transaction with items to domain', () => {
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
    const transaction = PrismaTransactionMapper.toDomain(prismaTransaction);

    expect(transaction.id).toBe('2f860c3a-c995-459e-b8f9-7a945dfd9157');
    expect(transaction.items).toHaveLength(1);
    expect(transaction.items[0].productId).toBe('a5b95f3f-74ad-4f0d-9730-8b1f463a5a49');
  });
});
