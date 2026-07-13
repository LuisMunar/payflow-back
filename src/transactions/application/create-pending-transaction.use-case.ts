import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../products/domain/product.entity';
import {
  PRODUCTS_REPOSITORY,
  ProductsRepository,
} from '../../products/domain/products.repository';
import { Transaction } from '../domain/transaction.entity';
import {
  TRANSACTIONS_REPOSITORY,
  TransactionsRepository,
} from '../domain/transactions.repository';

export type CreatePendingTransactionInput = {
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export class TransactionProductsNotFoundError extends Error {
  constructor(productIds: string[]) {
    super(`Products not found: ${productIds.join(', ')}`);
  }
}

@Injectable()
export class CreatePendingTransactionUseCase {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: ProductsRepository,
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async execute(input: CreatePendingTransactionInput): Promise<Transaction> {
    const requestedItems = this.mergeDuplicatedItems(input.items);
    const productIds = requestedItems.map((item) => item.productId);
    const products = await this.productsRepository.findByIds(productIds);
    const productsById = new Map(products.map((product) => [product.id, product]));
    const missingProductIds = productIds.filter((productId) => !productsById.has(productId));

    if (missingProductIds.length > 0) {
      throw new TransactionProductsNotFoundError(missingProductIds);
    }

    const transaction = Transaction.createPending({
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      items: requestedItems.map((item) => ({
        product: productsById.get(item.productId) as Product,
        quantity: item.quantity,
      })),
    });

    return this.transactionsRepository.create(transaction);
  }

  private mergeDuplicatedItems(
    items: CreatePendingTransactionInput['items'],
  ): CreatePendingTransactionInput['items'] {
    const quantitiesByProductId = new Map<string, number>();

    for (const item of items) {
      quantitiesByProductId.set(
        item.productId,
        (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity,
      );
    }

    return Array.from(quantitiesByProductId.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }
}
