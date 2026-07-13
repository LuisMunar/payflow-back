export type TransactionItemProps = {
  id?: string;
  productId: string;
  quantity: number;
  unitPriceInCents: number;
  totalInCents: number;
};

export class TransactionItem {
  constructor(private readonly props: TransactionItemProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPriceInCents(): number {
    return this.props.unitPriceInCents;
  }

  get totalInCents(): number {
    return this.props.totalInCents;
  }
}
