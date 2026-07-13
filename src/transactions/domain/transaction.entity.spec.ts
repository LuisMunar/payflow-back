import {
  InsufficientProductStockError,
  Product,
} from '../../products/domain/product.entity';
import {
  Transaction,
  TransactionCannotBeProcessedError,
} from './transaction.entity';
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

  it('applies an approved gateway result to a pending transaction', () => {
    const transaction = Transaction.createPending({
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [{ product, quantity: 1 }],
    });

    transaction.applyGatewayResult({
      status: TransactionStatus.APPROVED,
      gatewayTransactionId: 'gateway-transaction-id',
      gatewayStatus: 'APPROVED',
      cardBrand: 'VISA',
      cardLastFour: '4242',
    });

    expect(transaction.isApproved()).toBe(true);
    expect(transaction.gatewayTransactionId).toBe('gateway-transaction-id');
    expect(transaction.gatewayStatus).toBe('APPROVED');
    expect(transaction.cardBrand).toBe('VISA');
    expect(transaction.cardLastFour).toBe('4242');
  });

  it('does not allow processing a transaction twice', () => {
    const transaction = new Transaction({
      id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
      reference: 'PF-reference',
      status: TransactionStatus.APPROVED,
      amountInCents: 18990000,
      currency: 'COP',
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [],
    });

    expect(() => transaction.ensureCanBeProcessed()).toThrow(
      TransactionCannotBeProcessedError,
    );
  });

  it('describes processed transactions without id', () => {
    const transaction = new Transaction({
      reference: 'PF-reference',
      status: TransactionStatus.APPROVED,
      amountInCents: 18990000,
      currency: 'COP',
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [],
    });

    expect(() => transaction.ensureCanBeProcessed()).toThrow(
      'Transaction without id cannot be processed',
    );
  });

  it('exposes persisted timestamps', () => {
    const createdAt = new Date('2026-07-13T00:00:00.000Z');
    const updatedAt = new Date('2026-07-13T01:00:00.000Z');
    const transaction = new Transaction({
      id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
      reference: 'PF-reference',
      status: TransactionStatus.PENDING,
      amountInCents: 18990000,
      currency: 'COP',
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      createdAt,
      updatedAt,
      items: [],
    });

    expect(transaction.createdAt).toBe(createdAt);
    expect(transaction.updatedAt).toBe(updatedAt);
  });
});
