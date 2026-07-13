import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '../domain/product.entity';

export class PrismaProductMapper {
  static toDomain(product: PrismaProduct): Product {
    return new Product({
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      currency: product.currency,
      stock: product.stock,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }
}
