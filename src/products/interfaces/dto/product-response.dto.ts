import { Product } from '../../domain/product.entity';

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  stock: number;
  available: boolean;
  imageUrl: string;

  static fromDomain(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      currency: product.currency,
      stock: product.stock,
      available: product.isAvailable(),
      imageUrl: product.imageUrl,
    };
  }
}
