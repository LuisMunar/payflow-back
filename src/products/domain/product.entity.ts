export type ProductProps = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  stock: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export class InvalidProductQuantityError extends Error {
  constructor() {
    super('Product quantity must be greater than zero');
  }
}

export class InsufficientProductStockError extends Error {
  constructor(productId: string) {
    super(`Product ${productId} does not have enough stock`);
  }
}

export class Product {
  constructor(private readonly props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get currency(): string {
    return this.props.currency;
  }

  get stock(): number {
    return this.props.stock;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isAvailable(): boolean {
    return this.props.stock > 0;
  }

  ensureCanPurchase(quantity: number): void {
    if (quantity <= 0) {
      throw new InvalidProductQuantityError();
    }

    if (this.props.stock < quantity) {
      throw new InsufficientProductStockError(this.props.id);
    }
  }
}
