import { ConfigService } from '@nestjs/config';
import { TransactionStatus } from '../../transactions/domain/transaction-status';
import { PaymentGatewayError } from '../domain/payment-gateway';
import { WompiPaymentGateway } from './wompi-payment-gateway';

describe('WompiPaymentGateway', () => {
  const input = {
    reference: 'PF-reference',
    amountInCents: 18990000,
    currency: 'COP',
    customerEmail: 'luis@example.test',
    card: {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '30',
      cvc: '123',
      cardHolder: 'Luis Munar',
    },
    installments: 1,
  };
  const configService = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        PAYMENT_API_BASE_URL: 'https://gateway.example.test/v1',
        PAYMENT_PUBLIC_KEY: 'pub_test',
        PAYMENT_PRIVATE_KEY: 'prv_test',
        PAYMENT_INTEGRITY_KEY: 'integrity_test',
      };

      return values[key];
    }),
  } as unknown as ConfigService;

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('processes an approved card payment', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        createResponse({
          data: {
            presigned_acceptance: { acceptance_token: 'acceptance-token' },
            presigned_personal_data_auth: {
              acceptance_token: 'personal-auth-token',
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          status: 'CREATED',
          data: {
            id: 'card-token',
            brand: 'VISA',
            last_four: '4242',
          },
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          data: {
            id: 'gateway-transaction',
            status: 'APPROVED',
            payment_method: {
              extra: {
                brand: 'VISA',
                last_four: '4242',
              },
            },
          },
        }),
      );
    const gateway = new WompiPaymentGateway(configService);

    const result = await gateway.processCardPayment(input);

    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(result.gatewayTransactionId).toBe('gateway-transaction');
    expect(result.cardBrand).toBe('VISA');
    expect(result.cardLastFour).toBe('4242');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [url, requestInit] = fetchMock.mock.calls[2] as [string, RequestInit];

    expect(url).toBe('https://gateway.example.test/v1/transactions');
    expect(requestInit.method).toBe('POST');
    expect(typeof requestInit.body).toBe('string');

    if (typeof requestInit.body !== 'string') {
      throw new Error('Expected request body to be a string');
    }

    expect(requestInit.body).toContain('"signature"');
  });

  it('throws payment gateway errors when the provider rejects a request', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      createResponse(
        {
          error: { reason: 'Invalid key' },
        },
        false,
        401,
      ),
    );
    const gateway = new WompiPaymentGateway(configService);

    await expect(gateway.processCardPayment(input)).rejects.toBeInstanceOf(
      PaymentGatewayError,
    );
  });

  it('polls a pending gateway transaction until it is declined', async () => {
    jest.useFakeTimers();
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(createAcceptanceTokensResponse())
      .mockResolvedValueOnce(createCardTokenResponse())
      .mockResolvedValueOnce(
        createResponse({
          data: {
            id: 'gateway-transaction',
            status: 'PENDING',
            payment_method: null,
          },
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          data: {
            id: 'gateway-transaction',
            status: 'DECLINED',
            payment_method: {
              brand: 'VISA',
              last_four: '4242',
            },
          },
        }),
      );
    const gateway = new WompiPaymentGateway(configService);

    const paymentResult = gateway.processCardPayment(input);
    await jest.advanceTimersByTimeAsync(1000);
    const result = await paymentResult;

    expect(result.status).toBe(TransactionStatus.DECLINED);
    expect(result.gatewayStatus).toBe('DECLINED');
  });

  it('maps gateway error statuses to local error statuses', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(createAcceptanceTokensResponse())
      .mockResolvedValueOnce(createCardTokenResponse())
      .mockResolvedValueOnce(
        createResponse({
          data: {
            id: 'gateway-transaction',
            status: 'ERROR',
            payment_method: null,
          },
        }),
      );
    const gateway = new WompiPaymentGateway(configService);

    const result = await gateway.processCardPayment(input);

    expect(result.status).toBe(TransactionStatus.ERROR);
    expect(result.gatewayStatus).toBe('ERROR');
  });
});

function createResponse(
  body: unknown,
  ok = true,
  status = 200,
): Response {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function createAcceptanceTokensResponse(): Response {
  return createResponse({
    data: {
      presigned_acceptance: { acceptance_token: 'acceptance-token' },
      presigned_personal_data_auth: {
        acceptance_token: 'personal-auth-token',
      },
    },
  });
}

function createCardTokenResponse(): Response {
  return createResponse({
    status: 'CREATED',
    data: {
      id: 'card-token',
      brand: 'VISA',
      last_four: '4242',
    },
  });
}
