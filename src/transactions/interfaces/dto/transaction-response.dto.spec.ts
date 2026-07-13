import { Transaction } from '../../domain/transaction.entity';
import { TransactionItem } from '../../domain/transaction-item.entity';
import { TransactionStatus } from '../../domain/transaction-status';
import { TransactionResponseDto } from './transaction-response.dto';

describe('TransactionResponseDto', () => {
  it('maps a domain transaction to response dto', () => {
    const transaction = new Transaction({
      id: '2f860c3a-c995-459e-b8f9-7a945dfd9157',
      reference: 'PF-reference',
      status: TransactionStatus.PENDING,
      amountInCents: 18990000,
      currency: 'COP',
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [
        new TransactionItem({
          id: 'a0da9e5c-6612-4603-9094-b1bb5a85d8d0',
          productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
          quantity: 1,
          unitPriceInCents: 18990000,
          totalInCents: 18990000,
        }),
      ],
    });

    expect(TransactionResponseDto.fromDomain(transaction)).toEqual({
      id: transaction.id,
      reference: 'PF-reference',
      status: 'PENDING',
      amountInCents: 18990000,
      currency: 'COP',
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      cardBrand: undefined,
      cardLastFour: undefined,
      gatewayTransactionId: undefined,
      gatewayStatus: undefined,
      items: [
        {
          id: 'a0da9e5c-6612-4603-9094-b1bb5a85d8d0',
          productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
          quantity: 1,
          unitPriceInCents: 18990000,
          totalInCents: 18990000,
        },
      ],
    });
  });
});
