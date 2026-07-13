import { Product } from '../../domain/product.entity';
import { ProductResponseDto } from './product-response.dto';

describe('ProductResponseDto', () => {
  it('maps a domain product to response dto', () => {
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

    expect(ProductResponseDto.fromDomain(product)).toEqual({
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      currency: product.currency,
      stock: product.stock,
      available: true,
      imageUrl: product.imageUrl,
    });
  });
});
