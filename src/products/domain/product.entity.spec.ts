import { Product, ProductProps } from './product.entity';

describe('Product', () => {
  const baseProps: ProductProps = {
    id: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
    name: 'Wireless Keyboard',
    description: 'Compact mechanical keyboard.',
    priceInCents: 18990000,
    currency: 'COP',
    stock: 12,
    imageUrl: 'https://example.test/keyboard.jpg',
    createdAt: new Date('2026-07-13T00:00:00.000Z'),
    updatedAt: new Date('2026-07-13T00:00:00.000Z'),
  };

  it('exposes product properties', () => {
    const product = new Product(baseProps);

    expect(product.id).toBe(baseProps.id);
    expect(product.name).toBe(baseProps.name);
    expect(product.description).toBe(baseProps.description);
    expect(product.priceInCents).toBe(baseProps.priceInCents);
    expect(product.currency).toBe(baseProps.currency);
    expect(product.stock).toBe(baseProps.stock);
    expect(product.imageUrl).toBe(baseProps.imageUrl);
    expect(product.createdAt).toBe(baseProps.createdAt);
    expect(product.updatedAt).toBe(baseProps.updatedAt);
  });

  it('is available when stock is greater than zero', () => {
    expect(new Product(baseProps).isAvailable()).toBe(true);
  });

  it('is not available when stock is zero', () => {
    expect(new Product({ ...baseProps, stock: 0 }).isAvailable()).toBe(false);
  });
});
