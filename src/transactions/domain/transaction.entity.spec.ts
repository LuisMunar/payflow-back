import {
  InsufficientProductStockError,
  Product,
} from '../../products/domain/product.entity';
import { Transaction } from './transaction.entity';
import { TransactionStatus } from './transaction-status';

describe('Transaction', () => {
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

  it('creates a pending transaction calculating item totals', () => {
    const transaction = Transaction.createPending({
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [{ product, quantity: 2 }],
    });

    expect(transaction.reference).toMatch(/^PF-/);
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.amountInCents).toBe(37980000);
    expect(transaction.currency).toBe('COP');
    expect(transaction.items).toHaveLength(1);
    expect(transaction.items[0].totalInCents).toBe(37980000);
  });

  it('fails when a product does not have enough stock', () => {
    const unavailableProduct = new Product({
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      currency: product.currency,
      stock: 1,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });

    expect(() =>
      Transaction.createPending({
        customerName: 'Luis Munar',
        customerEmail: 'luis@example.test',
        items: [{ product: unavailableProduct, quantity: 2 }],
      }),
    ).toThrow(InsufficientProductStockError);
  });
});
