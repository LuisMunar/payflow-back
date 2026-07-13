import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../domain/transaction.entity';
import {
  TRANSACTIONS_REPOSITORY,
  TransactionsRepository,
} from '../domain/transactions.repository';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  execute(id: string): Promise<Transaction | null> {
    return this.transactionsRepository.findById(id);
  }
}
