import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Transaction } from '../domain/transaction.entity';
import { TransactionsRepository } from '../domain/transactions.repository';
import { PrismaTransactionMapper } from './prisma-transaction.mapper';

@Injectable()
export class PrismaTransactionsRepository implements TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const createdTransaction = await this.prisma.transaction.create({
      data: {
        reference: transaction.reference,
        status: transaction.status,
        amountInCents: transaction.amountInCents,
        currency: transaction.currency,
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        cardBrand: transaction.cardBrand,
        cardLastFour: transaction.cardLastFour,
        gatewayTransactionId: transaction.gatewayTransactionId,
        gatewayStatus: transaction.gatewayStatus,
        items: {
          create: transaction.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceInCents: item.unitPriceInCents,
            totalInCents: item.totalInCents,
          })),
        },
      },
      include: { items: true },
    });

    return PrismaTransactionMapper.toDomain(createdTransaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });

    return transaction ? PrismaTransactionMapper.toDomain(transaction) : null;
  }
}
