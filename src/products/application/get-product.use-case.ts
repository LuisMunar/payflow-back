import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCTS_REPOSITORY,
  ProductsRepository,
} from '../domain/products.repository';
import { Product } from '../domain/product.entity';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: ProductsRepository,
  ) {}

  execute(id: string): Promise<Product | null> {
    return this.productsRepository.findById(id);
  }
}
