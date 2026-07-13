import { Controller, Get, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { GetProductUseCase } from '../application/get-product.use-case';
import { ListProductsUseCase } from '../application/list-products.use-case';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
  ) {}

  @Get()
  async listProducts(): Promise<ProductResponseDto[]> {
    const products = await this.listProductsUseCase.execute();

    return products.map((product) => ProductResponseDto.fromDomain(product));
  }

  @Get(':id')
  async getProduct(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    const product = await this.getProductUseCase.execute(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return ProductResponseDto.fromDomain(product);
  }
}
