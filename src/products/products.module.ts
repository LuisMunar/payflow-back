import { Module } from '@nestjs/common';
import { GetProductUseCase } from './application/get-product.use-case';
import { ListProductsUseCase } from './application/list-products.use-case';
import { PRODUCTS_REPOSITORY } from './domain/products.repository';
import { PrismaProductsRepository } from './infrastructure/prisma-products.repository';
import { ProductsController } from './interfaces/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [
    ListProductsUseCase,
    GetProductUseCase,
    {
      provide: PRODUCTS_REPOSITORY,
      useClass: PrismaProductsRepository,
    },
  ],
})
export class ProductsModule {}
