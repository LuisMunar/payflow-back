import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product } from '../domain/product.entity';
import { ProductsRepository } from '../domain/products.repository';
import { PrismaProductMapper } from './prisma-product.mapper';

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    return products.map((product) => PrismaProductMapper.toDomain(product));
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    return product ? PrismaProductMapper.toDomain(product) : null;
  }
}
