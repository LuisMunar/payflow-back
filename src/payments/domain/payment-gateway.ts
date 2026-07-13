import { TransactionStatus } from '../../transactions/domain/transaction-status';

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export type CardPaymentGatewayInput = {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  card: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    cardHolder: string;
  };
  installments: number;
};

export type CardPaymentGatewayResult = {
  status: TransactionStatus;
  gatewayTransactionId?: string | null;
  gatewayStatus?: string | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
};

export class PaymentGatewayError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface PaymentGateway {
  processCardPayment(input: CardPaymentGatewayInput): Promise<CardPaymentGatewayResult>;
}
