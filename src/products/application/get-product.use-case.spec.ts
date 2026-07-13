import { Product } from '../domain/product.entity';
import { ProductsRepository } from '../domain/products.repository';
import { GetProductUseCase } from './get-product.use-case';

describe('GetProductUseCase', () => {
  it('returns a product by id', async () => {
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
    const findById = jest.fn().mockResolvedValue(product);
    const repository: jest.Mocked<ProductsRepository> = {
      findAll: jest.fn(),
      findById,
    };
    const useCase = new GetProductUseCase(repository);

    await expect(useCase.execute(product.id)).resolves.toBe(product);
    expect(findById).toHaveBeenCalledWith(product.id);
  });

  it('returns null when product does not exist', async () => {
    const repository: jest.Mocked<ProductsRepository> = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetProductUseCase(repository);

    await expect(useCase.execute('a5b95f3f-74ad-4f0d-9730-8b1f463a5a49')).resolves.toBeNull();
  });
});
