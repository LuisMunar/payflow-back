import { randomUUID } from 'node:crypto';
import { Product } from '../../products/domain/product.entity';
import { TransactionItem } from './transaction-item.entity';
import { TransactionStatus } from './transaction-status';

export type TransactionProps = {
  id?: string;
  reference: string;
  status: TransactionStatus;
  amountInCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  gatewayTransactionId?: string | null;
  gatewayStatus?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  items: TransactionItem[];
};

export type CreatePendingTransactionItem = {
  product: Product;
  quantity: number;
};

export type GatewayPaymentResult = {
  status: TransactionStatus;
  gatewayTransactionId?: string | null;
  gatewayStatus?: string | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
};

export class TransactionCannotBeProcessedError extends Error {
  constructor(transactionId: string | undefined) {
    super(`Transaction ${transactionId ?? 'without id'} cannot be processed`);
  }
}

export class Transaction {
  constructor(private readonly props: TransactionProps) {}

  static createPending(input: {
    customerName: string;
    customerEmail: string;
    items: CreatePendingTransactionItem[];
  }): Transaction {
    const items = input.items.map(({ product, quantity }) => {
      product.ensureCanPurchase(quantity);

      return new TransactionItem({
        productId: product.id,
        quantity,
        unitPriceInCents: product.priceInCents,
        totalInCents: product.priceInCents * quantity,
      });
    });
    const amountInCents = items.reduce((total, item) => total + item.totalInCents, 0);

    return new Transaction({
      reference: `PF-${randomUUID()}`,
      status: TransactionStatus.PENDING,
      amountInCents,
      currency: 'COP',
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      items,
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get reference(): string {
    return this.props.reference;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get amountInCents(): number {
    return this.props.amountInCents;
  }

  get currency(): string {
    return this.props.currency;
  }

  get customerName(): string {
    return this.props.customerName;
  }

  get customerEmail(): string {
    return this.props.customerEmail;
  }

  get cardBrand(): string | null | undefined {
    return this.props.cardBrand;
  }

  get cardLastFour(): string | null | undefined {
    return this.props.cardLastFour;
  }

  get gatewayTransactionId(): string | null | undefined {
    return this.props.gatewayTransactionId;
  }

  get gatewayStatus(): string | null | undefined {
    return this.props.gatewayStatus;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get items(): TransactionItem[] {
    return this.props.items;
  }

  isApproved(): boolean {
    return this.props.status === TransactionStatus.APPROVED;
  }

  ensureCanBeProcessed(): void {
    if (this.props.status !== TransactionStatus.PENDING) {
      throw new TransactionCannotBeProcessedError(this.props.id);
    }
  }

  applyGatewayResult(result: GatewayPaymentResult): void {
    this.ensureCanBeProcessed();

    this.props.status = result.status;
    this.props.gatewayTransactionId = result.gatewayTransactionId;
    this.props.gatewayStatus = result.gatewayStatus;
    this.props.cardBrand = result.cardBrand;
    this.props.cardLastFour = result.cardLastFour;
  }

  markAsPaymentError(gatewayStatus = 'ERROR'): void {
    this.ensureCanBeProcessed();

    this.props.status = TransactionStatus.ERROR;
    this.props.gatewayStatus = gatewayStatus;
  }
}
