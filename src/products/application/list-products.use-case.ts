import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCTS_REPOSITORY,
  ProductsRepository,
} from '../domain/products.repository';
import { Product } from '../domain/product.entity';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: ProductsRepository,
  ) {}

  execute(): Promise<Product[]> {
    return this.productsRepository.findAll();
  }
}
