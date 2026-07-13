import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  CreatePendingTransactionUseCase,
  TransactionProductsNotFoundError,
} from '../application/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '../application/get-transaction.use-case';
import {
  InsufficientProductStockError,
  InvalidProductQuantityError,
} from '../../products/domain/product.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createPendingTransactionUseCase: CreatePendingTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  @Post()
  async createTransaction(
    @Body() body: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    try {
      const transaction = await this.createPendingTransactionUseCase.execute(body);

      return TransactionResponseDto.fromDomain(transaction);
    } catch (error: unknown) {
      if (
        error instanceof TransactionProductsNotFoundError ||
        error instanceof InvalidProductQuantityError ||
        error instanceof InsufficientProductStockError
      ) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Get(':id')
  async getTransaction(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.getTransactionUseCase.execute(id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return TransactionResponseDto.fromDomain(transaction);
  }
}
