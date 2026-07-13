import { Transaction } from './transaction.entity';

export const TRANSACTIONS_REPOSITORY = Symbol('TRANSACTIONS_REPOSITORY');

export interface TransactionsRepository {
  create(transaction: Transaction): Promise<Transaction>;
  completePayment(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
}
