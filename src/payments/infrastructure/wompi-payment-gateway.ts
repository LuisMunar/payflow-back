import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionStatus } from '../../transactions/domain/transaction-status';
import {
  CardPaymentGatewayInput,
  CardPaymentGatewayResult,
  PaymentGateway,
  PaymentGatewayError,
} from '../domain/payment-gateway';

type AcceptanceTokensResponse = {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
    };
    presigned_personal_data_auth: {
      acceptance_token: string;
    };
  };
};

type CardTokenResponse = {
  status: string;
  data: {
    id: string;
    brand?: string | null;
    last_four?: string | null;
  };
};

type GatewayTransactionData = {
  id: string;
  status: string;
  payment_method?: {
    brand?: string | null;
    last_four?: string | null;
    extra?: {
      brand?: string | null;
      last_four?: string | null;
    } | null;
  } | null;
};

type GatewayTransactionResponse = {
  data: GatewayTransactionData;
};

@Injectable()
export class WompiPaymentGateway implements PaymentGateway {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;
  private readonly pollingAttempts = 6;
  private readonly pollingDelayMs = 1000;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.getOrThrow<string>('PAYMENT_API_BASE_URL');
    this.publicKey = this.configService.getOrThrow<string>('PAYMENT_PUBLIC_KEY');
    this.privateKey = this.configService.getOrThrow<string>('PAYMENT_PRIVATE_KEY');
    this.integrityKey = this.configService.getOrThrow<string>('PAYMENT_INTEGRITY_KEY');
  }

  async processCardPayment(
    input: CardPaymentGatewayInput,
  ): Promise<CardPaymentGatewayResult> {
    const acceptanceTokens = await this.getAcceptanceTokens();
    const cardToken = await this.tokenizeCard(input);
    const createdTransaction = await this.createCardTransaction(
      input,
      cardToken.data.id,
      acceptanceTokens,
    );
    const resolvedTransaction = await this.resolveTransaction(createdTransaction.data);

    return this.toPaymentResult(resolvedTransaction, cardToken);
  }

  private async getAcceptanceTokens(): Promise<AcceptanceTokensResponse> {
    return this.request<AcceptanceTokensResponse>(
      `/merchants/${this.publicKey}`,
      'GET',
    );
  }

  private async tokenizeCard(input: CardPaymentGatewayInput): Promise<CardTokenResponse> {
    return this.request<CardTokenResponse>('/tokens/cards', 'POST', {
      headers: this.authHeaders(this.publicKey),
      body: {
        number: input.card.number,
        exp_month: input.card.expMonth,
        exp_year: input.card.expYear,
        cvc: input.card.cvc,
        card_holder: input.card.cardHolder,
      },
    });
  }

  private async createCardTransaction(
    input: CardPaymentGatewayInput,
    cardToken: string,
    tokens: AcceptanceTokensResponse,
  ): Promise<GatewayTransactionResponse> {
    return this.request<GatewayTransactionResponse>('/transactions', 'POST', {
      headers: this.authHeaders(this.privateKey),
      body: {
        acceptance_token: tokens.data.presigned_acceptance.acceptance_token,
        accept_personal_auth:
          tokens.data.presigned_personal_data_auth.acceptance_token,
        amount_in_cents: input.amountInCents,
        currency: input.currency,
        customer_email: input.customerEmail,
        reference: input.reference,
        signature: this.createIntegritySignature(input),
        payment_method_type: 'CARD',
        payment_method: {
          type: 'CARD',
          token: cardToken,
          installments: input.installments,
        },
      },
    });
  }

  private async resolveTransaction(
    transaction: GatewayTransactionData,
  ): Promise<GatewayTransactionData> {
    if (this.isFinalStatus(transaction.status)) {
      return transaction;
    }

    let currentTransaction = transaction;

    for (let attempt = 0; attempt < this.pollingAttempts; attempt++) {
      await this.delay(this.pollingDelayMs);
      const response = await this.request<GatewayTransactionResponse>(
        `/transactions/${transaction.id}`,
        'GET',
        { headers: this.authHeaders(this.publicKey) },
      );

      currentTransaction = response.data;

      if (this.isFinalStatus(currentTransaction.status)) {
        return currentTransaction;
      }
    }

    return currentTransaction;
  }

  private toPaymentResult(
    transaction: GatewayTransactionData,
    cardToken: CardTokenResponse,
  ): CardPaymentGatewayResult {
    return {
      status: this.toTransactionStatus(transaction.status),
      gatewayTransactionId: transaction.id,
      gatewayStatus: transaction.status,
      cardBrand:
        transaction.payment_method?.extra?.brand ??
        transaction.payment_method?.brand ??
        cardToken.data.brand ??
        null,
      cardLastFour:
        transaction.payment_method?.extra?.last_four ??
        transaction.payment_method?.last_four ??
        cardToken.data.last_four ??
        null,
    };
  }

  private createIntegritySignature(input: CardPaymentGatewayInput): string {
    return createHash('sha256')
      .update(
        `${input.reference}${input.amountInCents}${input.currency}${this.integrityKey}`,
      )
      .digest('hex');
  }

  private toTransactionStatus(status: string): TransactionStatus {
    if (status === 'APPROVED') {
      return TransactionStatus.APPROVED;
    }

    if (status === 'DECLINED' || status === 'VOIDED') {
      return TransactionStatus.DECLINED;
    }

    if (status === 'ERROR') {
      return TransactionStatus.ERROR;
    }

    return TransactionStatus.PENDING;
  }

  private isFinalStatus(status: string): boolean {
    return ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'].includes(status);
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST',
    options?: {
      headers?: Record<string, string>;
      body?: Record<string, unknown>;
    },
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      throw new PaymentGatewayError('Payment gateway request failed');
    }

    const body = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      throw new PaymentGatewayError(
        `Payment gateway request failed with status ${response.status}`,
      );
    }

    return body as T;
  }

  private authHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
