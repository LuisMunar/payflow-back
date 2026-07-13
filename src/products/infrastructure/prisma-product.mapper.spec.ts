import { Product as PrismaProduct } from '@prisma/client';
import { PrismaProductMapper } from './prisma-product.mapper';

describe('PrismaProductMapper', () => {
  it('maps a Prisma product to domain', () => {
    const createdAt = new Date('2026-07-13T00:00:00.000Z');
    const updatedAt = new Date('2026-07-13T00:00:00.000Z');
    const prismaProduct: PrismaProduct = {
      id: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
      name: 'Wireless Keyboard',
      description: 'Compact mechanical keyboard.',
      priceInCents: 18990000,
      currency: 'COP',
      stock: 12,
      imageUrl: 'https://example.test/keyboard.jpg',
      createdAt,
      updatedAt,
    };

    const product = PrismaProductMapper.toDomain(prismaProduct);

    expect(product.id).toBe(prismaProduct.id);
    expect(product.name).toBe(prismaProduct.name);
    expect(product.priceInCents).toBe(prismaProduct.priceInCents);
    expect(product.createdAt).toBe(createdAt);
    expect(product.updatedAt).toBe(updatedAt);
  });
});
