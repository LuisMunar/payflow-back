import { Transaction } from '../domain/transaction.entity';
import { TransactionStatus } from '../domain/transaction-status';
import { TransactionsRepository } from '../domain/transactions.repository';
import { GetTransactionUseCase } from './get-transaction.use-case';

describe('GetTransactionUseCase', () => {
  it('returns a transaction by id', async () => {
    const transaction = new Transaction({
      id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
      reference: 'PF-reference',
      status: TransactionStatus.PENDING,
      amountInCents: 1000,
      currency: 'COP',
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [],
    });
    const findById = jest.fn().mockResolvedValue(transaction);
    const repository: jest.Mocked<TransactionsRepository> = {
      create: jest.fn(),
      completePayment: jest.fn(),
      findById,
    };
    const useCase = new GetTransactionUseCase(repository);

    await expect(useCase.execute(transaction.id as string)).resolves.toBe(transaction);
    expect(findById).toHaveBeenCalledWith(transaction.id);
  });
});
