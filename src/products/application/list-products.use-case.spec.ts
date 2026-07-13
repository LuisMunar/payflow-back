import { Product } from '../domain/product.entity';
import { ProductsRepository } from '../domain/products.repository';
import { ListProductsUseCase } from './list-products.use-case';

describe('ListProductsUseCase', () => {
  it('returns products from repository', async () => {
    const products = [
      new Product({
        id: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
        name: 'Wireless Keyboard',
        description: 'Compact mechanical keyboard.',
        priceInCents: 18990000,
        currency: 'COP',
        stock: 12,
        imageUrl: 'https://example.test/keyboard.jpg',
        createdAt: new Date('2026-07-13T00:00:00.000Z'),
        updatedAt: new Date('2026-07-13T00:00:00.000Z'),
      }),
    ];
    const findAll = jest.fn().mockResolvedValue(products);
    const repository: jest.Mocked<ProductsRepository> = {
      findAll,
      findById: jest.fn(),
    };
    const useCase = new ListProductsUseCase(repository);

    await expect(useCase.execute()).resolves.toBe(products);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
