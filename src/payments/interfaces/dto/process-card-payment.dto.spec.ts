import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CardPaymentDto, ProcessCardPaymentDto } from './process-card-payment.dto';

describe('ProcessCardPaymentDto', () => {
  it('validates a card payment payload', async () => {
    const dto = plainToInstance(ProcessCardPaymentDto, {
      card: {
        number: '4242424242424242',
        expMonth: '12',
        expYear: '30',
        cvc: '123',
        cardHolder: 'Luis Munar',
      },
      installments: 1,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.card).toBeInstanceOf(CardPaymentDto);
  });

  it('rejects invalid card data', async () => {
    const dto = plainToInstance(ProcessCardPaymentDto, {
      card: {
        number: '123',
        expMonth: '99',
        expYear: '2030',
        cvc: 'abc',
        cardHolder: 'Lu',
      },
      installments: 1,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].children).toHaveLength(5);
  });

  it('rejects installments outside the accepted range', async () => {
    const dto = plainToInstance(ProcessCardPaymentDto, {
      card: {
        number: '4242424242424242',
        expMonth: '12',
        expYear: '30',
        cvc: '123',
        cardHolder: 'Luis Munar',
      },
      installments: 37,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('installments');
  });
});
