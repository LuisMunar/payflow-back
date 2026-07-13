import { NotFoundException } from '@nestjs/common';
import { GetProductUseCase } from '../application/get-product.use-case';
import { ListProductsUseCase } from '../application/list-products.use-case';
import { Product } from '../domain/product.entity';
import { ProductsController } from './products.controller';

describe('ProductsController', () => {
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

  it('lists products', async () => {
    const listProductsUseCase = {
      execute: jest.fn().mockResolvedValue([product]),
    };
    const getProductUseCase = {
      execute: jest.fn(),
    } as unknown as GetProductUseCase;
    const controller = new ProductsController(
      listProductsUseCase as unknown as ListProductsUseCase,
      getProductUseCase,
    );

    const response = await controller.listProducts();

    expect(response).toHaveLength(1);
    expect(response[0].id).toBe(product.id);
  });

  it('gets a product by id', async () => {
    const getProduct = jest.fn().mockResolvedValue(product);
    const listProductsUseCase = {
      execute: jest.fn(),
    };
    const getProductUseCase = {
      execute: getProduct,
    } as unknown as GetProductUseCase;
    const controller = new ProductsController(
      listProductsUseCase as unknown as ListProductsUseCase,
      getProductUseCase,
    );

    const response = await controller.getProduct(product.id);

    expect(response.id).toBe(product.id);
    expect(getProduct).toHaveBeenCalledWith(product.id);
  });

  it('throws not found when product does not exist', async () => {
    const listProductsUseCase = {
      execute: jest.fn(),
    };
    const getProductUseCase = {
      execute: jest.fn().mockResolvedValue(null),
    } as unknown as GetProductUseCase;
    const controller = new ProductsController(
      listProductsUseCase as unknown as ListProductsUseCase,
      getProductUseCase,
    );

    await expect(controller.getProduct(product.id)).rejects.toBeInstanceOf(NotFoundException);
  });
});
