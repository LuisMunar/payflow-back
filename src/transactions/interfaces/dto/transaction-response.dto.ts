import { Transaction } from '../../domain/transaction.entity';

export class TransactionItemResponseDto {
  id?: string;
  productId: string;
  quantity: number;
  unitPriceInCents: number;
  totalInCents: number;
}

export class TransactionResponseDto {
  id?: string;
  reference: string;
  status: string;
  amountInCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  gatewayTransactionId?: string | null;
  gatewayStatus?: string | null;
  items: TransactionItemResponseDto[];

  static fromDomain(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
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
      items: transaction.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
        totalInCents: item.totalInCents,
      })),
    };
  }
}
