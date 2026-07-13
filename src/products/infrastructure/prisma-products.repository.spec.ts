import { PrismaService } from '../../prisma/prisma.service';
import { PrismaProductsRepository } from './prisma-products.repository';

describe('PrismaProductsRepository', () => {
  const prismaProduct = {
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

  it('finds all products ordered by name', async () => {
    const findMany = jest.fn().mockResolvedValue([prismaProduct]);
    const prisma = {
      product: {
        findMany,
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prisma);

    const products = await repository.findAll();

    expect(findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(products).toHaveLength(1);
    expect(products[0].id).toBe(prismaProduct.id);
  });

  it('finds a product by id', async () => {
    const findUnique = jest.fn().mockResolvedValue(prismaProduct);
    const prisma = {
      product: {
        findMany: jest.fn(),
        findUnique,
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prisma);

    const product = await repository.findById(prismaProduct.id);

    expect(findUnique).toHaveBeenCalledWith({ where: { id: prismaProduct.id } });
    expect(product?.id).toBe(prismaProduct.id);
  });

  it('returns null when product does not exist', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const prisma = {
      product: {
        findMany: jest.fn(),
        findUnique,
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prisma);

    await expect(repository.findById(prismaProduct.id)).resolves.toBeNull();
  });

  it('finds products by ids', async () => {
    const findMany = jest.fn().mockResolvedValue([prismaProduct]);
    const prisma = {
      product: {
        findMany,
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prisma);

    const products = await repository.findByIds([prismaProduct.id]);

    expect(findMany).toHaveBeenCalledWith({ where: { id: { in: [prismaProduct.id] } } });
    expect(products).toHaveLength(1);
  });
});
