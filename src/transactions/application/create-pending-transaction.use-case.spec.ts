import { Product } from '../../products/domain/product.entity';
import { ProductsRepository } from '../../products/domain/products.repository';
import { Transaction } from '../domain/transaction.entity';
import { TransactionItem } from '../domain/transaction-item.entity';
import { TransactionStatus } from '../domain/transaction-status';
import { TransactionsRepository } from '../domain/transactions.repository';
import {
  CreatePendingTransactionUseCase,
  TransactionProductsNotFoundError,
} from './create-pending-transaction.use-case';

describe('CreatePendingTransactionUseCase', () => {
  const product = new Product({
    id: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
    name: 'Wireless Keyboard',
    description: 'Compact mechanical keyboard.',
    priceInCents: 18990000,
    currency: 'COP',
    stock: 12,
    imageUrl: 'https://example.test/keyboard.jpg',
    createdAt: new Date('2026-07-13T00:00:00.000Z'),
    updatedAt: new Date('2026-07-13T00:00:00.000Z'),
  });

  it('creates a pending transaction with server-calculated totals', async () => {
    const findByIds = jest.fn().mockResolvedValue([product]);
    const create = jest.fn().mockImplementation((transaction: Transaction) =>
      Promise.resolve(
        new Transaction({
          id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
          reference: transaction.reference,
          status: transaction.status,
          amountInCents: transaction.amountInCents,
          currency: transaction.currency,
          customerName: transaction.customerName,
          customerEmail: transaction.customerEmail,
          items: transaction.items.map(
            (item) =>
              new TransactionItem({
                productId: item.productId,
                quantity: item.quantity,
                unitPriceInCents: item.unitPriceInCents,
                totalInCents: item.totalInCents,
              }),
          ),
        }),
      ),
    );
    const productsRepository: jest.Mocked<ProductsRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds,
    };
    const transactionsRepository: jest.Mocked<TransactionsRepository> = {
      create,
      findById: jest.fn(),
    };
    const useCase = new CreatePendingTransactionUseCase(
      productsRepository,
      transactionsRepository,
    );

    const transaction = await useCase.execute({
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [
        { productId: product.id, quantity: 1 },
        { productId: product.id, quantity: 2 },
      ],
    });

    expect(findByIds).toHaveBeenCalledWith([product.id]);
    expect(create).toHaveBeenCalledTimes(1);
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.amountInCents).toBe(56970000);
    expect(transaction.items[0].quantity).toBe(3);
  });

  it('fails when one or more products are missing', async () => {
    const productsRepository: jest.Mocked<ProductsRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn().mockResolvedValue([]),
    };
    const transactionsRepository: jest.Mocked<TransactionsRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    const useCase = new CreatePendingTransactionUseCase(
      productsRepository,
      transactionsRepository,
    );

    await expect(
      useCase.execute({
        customerName: 'Luis Munar',
        customerEmail: 'luis@example.test',
        items: [{ productId: product.id, quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(TransactionProductsNotFoundError);
  });
});
