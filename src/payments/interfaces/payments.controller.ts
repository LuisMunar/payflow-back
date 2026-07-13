import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  PaymentTransactionNotFoundError,
  ProcessCardPaymentUseCase,
  TransactionCannotBeProcessedError,
} from '../application/process-card-payment.use-case';
import { TransactionResponseDto } from '../../transactions/interfaces/dto/transaction-response.dto';
import { ProcessCardPaymentDto } from './dto/process-card-payment.dto';

@Controller('transactions/:transactionId/payments')
export class PaymentsController {
  constructor(private readonly processCardPaymentUseCase: ProcessCardPaymentUseCase) {}

  @Post('card')
  async processCardPayment(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @Body() body: ProcessCardPaymentDto,
  ): Promise<TransactionResponseDto> {
    try {
      const transaction = await this.processCardPaymentUseCase.execute({
        transactionId,
        card: body.card,
        installments: body.installments,
      });

      return TransactionResponseDto.fromDomain(transaction);
    } catch (error: unknown) {
      if (error instanceof PaymentTransactionNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof TransactionCannotBeProcessedError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
