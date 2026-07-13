import {
  Transaction as PrismaTransaction,
  TransactionItem as PrismaTransactionItem,
} from '@prisma/client';
import { Transaction } from '../domain/transaction.entity';
import { TransactionItem } from '../domain/transaction-item.entity';
import { TransactionStatus } from '../domain/transaction-status';

export type PrismaTransactionWithItems = PrismaTransaction & {
  items: PrismaTransactionItem[];
};

export class PrismaTransactionMapper {
  static toDomain(transaction: PrismaTransactionWithItems): Transaction {
    return new Transaction({
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status as TransactionStatus,
      amountInCents: transaction.amountInCents,
      currency: transaction.currency,
      customerName: transaction.customerName,
      customerEmail: transaction.customerEmail,
      cardBrand: transaction.cardBrand,
      cardLastFour: transaction.cardLastFour,
      gatewayTransactionId: transaction.gatewayTransactionId,
      gatewayStatus: transaction.gatewayStatus,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      items: transaction.items.map(
        (item) =>
          new TransactionItem({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPriceInCents: item.unitPriceInCents,
            totalInCents: item.totalInCents,
          }),
      ),
    });
  }
}
